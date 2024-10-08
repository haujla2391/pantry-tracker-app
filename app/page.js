"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import {firestore} from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, Snackbar } from "@mui/material";
import { collection, deleteDoc, getDocs, query, doc, getDoc, setDoc } from "firebase/firestore";
import { green } from "@mui/material/colors";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity+1})
    } else{
      await setDoc(docRef, {quantity:1})
    }
    
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if(quantity === 1){
        await deleteDoc(docRef)
      } 
      else {
        await setDoc(docRef, {quantity: quantity-1})
      }
    }

    await updateInventory()
  }

  const fetchSuggestions = async () => {
    try {
        const itemsString = inventory.map(item => `${item.name} (quantity: ${item.quantity})`).join(", ");
        const response = await fetch('/api/suggest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ role: 'user', content: `I have the following items in my inventory: ${itemsString}.` }]),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setSuggestions(data.suggestions); // Set the suggestions state
    } catch (error) {
        console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(()=>{
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between" // Distribute space evenly between children
      alignItems="center"
      gap={2}
      sx={{
        backgroundImage: 'url("/pantry.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        paddingBottom: 4, // Add bottom padding for breathing space
      }}
    >
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          width={400} 
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)" 
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button 
              variant="outlined" 
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }} 
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
  
      <TextField
        variant="outlined"
        placeholder="Search items..."
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          marginBottom: 2,
          backgroundColor: "#333",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "white",
            },
            "&:hover fieldset": {
              borderColor: "white",
            },
            "&.Mui-focused fieldset": {
              borderColor: "white",
            },
          },
          "& .MuiInputBase-input": {
            color: "white",
          },
          "& .MuiInputLabel-root": {
            color: "white",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "white",
          },
        }}
      />
  
      <Button 
        variant="contained"
        onClick={handleOpen}
        sx={{
          backgroundColor: "#DEB887", 
          color: "white", 
          "&:hover": {
            backgroundColor: "#0056b3", 
          },
        }}
      >
        Add New Item
      </Button>
  
      <Button variant="contained" onClick={fetchSuggestions}>
        Get Inventory Suggestions
      </Button>
  
      <Box border="1px solid #333">
        <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h2" color="#800000">Inventory Items</Typography>
        </Box>
  
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory
            .filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(({ name, quantity }) => (
              <Box key={name} width="100%" minHeight="150px" display="flex" justifyContent="space-between" alignItems="center"
                bgcolor="#f0f0f0" padding={5}>
                <Typography variant="h3" color="#333" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="#333" textAlign="center">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name);
                    }}
                    sx={{
                      backgroundColor: "green"
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name);
                    }}
                    sx={{
                      backgroundColor: "red"
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>

      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
          padding: 2,
          boxShadow: 3,
          border: '1px solid #ccc',
          marginTop: 2,
          width: '80%', // Adjust width as needed
          maxWidth: '1300px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#333">
          Suggestions:
        </Typography>
        <Typography variant="body1" color="#555">
          {suggestions ? suggestions : "No suggestions available."}
        </Typography>
      </Box>
    </Box>
  );  
}

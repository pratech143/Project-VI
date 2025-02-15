import { createSlice,createAsyncThunk, isFulfilled } from "@reduxjs/toolkit";
export const fetchLogin = createAsyncThunk('fetchLogin', async ({ email, password }) => {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
      method: "POST",  
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({ email, password })
    });
  
    if (!response.ok) {
      throw new Error("Login failed!");
    }
    console.log(email);
    console.log(password);
    return response.json();
  });
  
const authSlice=createSlice({
    name:"auth",
    initialState:{
        data:null,
        email:"",
        password:"",
        isLoading:false,
        isError:false,
        
    },
    extraReducers(builder){
        builder.addCase(fetchLogin.pending,(state,action)=>{
            state.isLoading=true
        })

        builder.addCase(fetchLogin.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.email=action.payload.email;
            state.password=action.payload.password;
            state.data=action.payload
        })
        
        builder.addCase(fetchLogin.rejected,(state,action)=>{
            state.isLoading=false;
            console.log("Error:",action.payload)
            state.isError=true 
        })
    }
    
});
export default authSlice.reducer;
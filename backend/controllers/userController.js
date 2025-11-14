import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

//create token
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}

//login user
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//register user
const registerUser = async (req,res) => {
    const {name, email, password} = req.body;
    try{
        //check if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//get all users
const getAllUsers = async (req,res) => {
    try{
        const users = await userModel.find({}, "-password") // Exclude password field
        res.json({success:true, data:users})
    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//get user data from token
const getUserData = async (req,res) => {
    try{
        const { token } = req.headers;
        if (!token) {
            return res.json({success:false,message:"Token not provided"})
        }
        
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(token_decode.id).select("-password");
        
        if (!user) {
            return res.json({success:false,message:"User not found"})
        }
        
        res.json({success:true, data:user})
    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//add customer by admin
const addCustomer = async (req, res) => {
    const { name, email, phone, address, password, dateOfBirth } = req.body;
    try {
        // Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Customer with this email already exists" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Use provided password or default password
        const userPassword = password || "123456789"; // Default password if not provided
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userPassword, salt);

        // Parse dateOfBirth if provided
        let parsedDateOfBirth = null;
        if (dateOfBirth) {
            parsedDateOfBirth = new Date(dateOfBirth);
        }

        const newCustomer = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            address: address || "",
            dateOfBirth: parsedDateOfBirth,
            purchases: 0,
            orderQuantity: 0,
            cartData: {}
        });

        const customer = await newCustomer.save();
        res.json({ 
            success: true, 
            message: "Customer added successfully",
            data: {
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                dateOfBirth: customer.dateOfBirth
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding customer" });
    }
}

export {loginUser, registerUser, getAllUsers, getUserData, addCustomer}
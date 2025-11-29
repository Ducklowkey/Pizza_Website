import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData:{type:Object,default:{}},
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    purchases: { type: Number, default: 0 },
    orderQuantity: { type: Number, default: 0 },
    image: { type: String, default: "" }
}, { minimize: false, timestamps: true })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
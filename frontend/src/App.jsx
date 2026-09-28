import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Layout Components
import { Header } from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';

// Public & User Pages
import Home from './Components/Home';
import ProductDetails from './Components/Product/ProductDetails';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import ForgotPassword from './Components/User/ForgotPassword';
import NewPassword from './Components/User/NewPassword';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';

// Admin Pages
import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import ProtectedRoute from './Components/Route/ProtectedRoute';

function App() {
  const [state, setState] = useState({
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
      : {},
  });

  // 1. Sync cartItems with localStorage whenever state.cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // 2. Sync shippingInfo with localStorage whenever state.shippingInfo changes
  useEffect(() => {
    localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo));
  }, [state.shippingInfo]);


  const addItemToCart = async (id, quantity) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)

      const isItemExist = state.cartItems.find(i => i.product === data.product._id)

      // Calculate new total quantity if item exists in cart
      const currentQtyInCart = isItemExist ? isItemExist.quantity : 0
      const newQuantity = currentQtyInCart + quantity

      // Prevent adding more than available stock
      if (newQuantity > data.product.stock) {
        toast.error(`Cannot add more items. Max stock available: ${data.product.stock}`, {
          position: 'top-left'
        })
        return
      }

      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images?.[0]?.url || '',
        stock: data.product.stock,
        quantity: newQuantity
      }

      setState(prevState => {
        const updatedCartItems = isItemExist
          ? prevState.cartItems.map(i => i.product === item.product ? item : i)
          : [...prevState.cartItems, item]

        return {
          ...prevState,
          cartItems: updatedCartItems
        }
      })

      toast.success('Item Added to Cart', {
        position: 'bottom-right'
      })

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart', {
        position: 'top-left'
      })
    } 
  }

  const removeItemFromCart = (id) => {
    // Pure state functional update (localStorage handles sync via useEffect automatically)
    setState((prevState) => ({
      ...prevState,
      cartItems: prevState.cartItems.filter((i) => i.product !== id),
    }));
  };

  const saveShippingInfo = (data) => {
    // Pure state functional update
    setState((prevState) => ({
      ...prevState,
      shippingInfo: data,
    }));
  };

  return (
    <>
      <Router>
        <Header cartItems={state.cartItems} />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} />
          <Route path="/search/:keyword" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<NewPassword />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/me/update" element={<UpdateProfile />} />
          <Route path="/password/update" element={<UpdatePassword />} />
          <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} />
          <Route path="/shipping" element={<Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} />} />
          <Route path="/confirm" element={<ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} />
          <Route path="/payment" element={<Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/orders/me" element={<ListOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />

          {/* Unprotected Admin Operations */}
          <Route path="/admin/product" element={<NewProduct />} />
          <Route path="/admin/product/:id" element={<UpdateProduct />} />
          <Route path="/admin/order/:id" element={<ProcessOrder />} />
          <Route path="/admin/user/:id" element={<UpdateUser />} />

          {/* Protected Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAdmin={true}>
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAdmin={true}>
                <OrdersList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default App;
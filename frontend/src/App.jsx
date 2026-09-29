import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Layout Components
import { Header } from "./Components/Layout/Header";
import Footer from "./Components/Layout/Footer";

// Public & User Pages
import Home from "./Components/Home";
import ProductDetails from "./Components/Product/ProductDetails";
import Login from "./Components/User/Login";
import Register from "./Components/User/Register";
import ForgotPassword from "./Components/User/ForgotPassword";
import NewPassword from "./Components/User/NewPassword";
import Profile from "./Components/User/Profile";
import UpdateProfile from "./Components/User/UpdateProfile";
import UpdatePassword from "./Components/User/UpdatePassword";
import Cart from "./Components/Cart/Cart";
import Shipping from "./Components/Cart/Shipping";
import ConfirmOrder from "./Components/Cart/ConfirmOrder";
import Payment from "./Components/Cart/Payment";
import OrderSuccess from "./Components/Cart/OrderSuccess";
import ListOrders from "./Components/Order/ListOrders";
import OrderDetails from "./Components/Order/OrderDetails";

// Admin Pages
import Dashboard from "./Components/Admin/Dashboard";
import ProductsList from "./Components/Admin/ProductsList";
import NewProduct from "./Components/Admin/NewProduct";
import UpdateProduct from "./Components/Admin/UpdateProduct";
import OrdersList from "./Components/Admin/OrdersList";
import ProcessOrder from "./Components/Admin/ProcessOrder";
import UsersList from "./Components/Admin/UsersList";
import UpdateUser from "./Components/Admin/UpdateUser";
import ProtectedRoute from "./Components/Route/ProtectedRoute";

import { getUser } from "./Components/Utils/helpers";

function App() {
  const [state, setState] = useState({
    user: getUser() || null,

    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],

    shippingInfo: localStorage.getItem("shippingInfo")
      ? JSON.parse(localStorage.getItem("shippingInfo"))
      : {},
  });

  // Sync cartItems with localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Sync shippingInfo with localStorage whenever shippingInfo changes
  useEffect(() => {
    localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
  }, [state.shippingInfo]);

  const setUserData = (user) => {
    setState((prevState) => ({
      ...prevState,
      user: user,
    }));
  };

  // Used when adding a product from ProductDetails
  const addItemToCart = async (id, quantity) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/product/${id}`
      );

      const existingItem = state.cartItems.find(
        (item) => item.product === data.product._id
      );

      const currentQty = existingItem ? existingItem.quantity : 0;

      const newQuantity = currentQty + quantity;

      if (newQuantity > data.product.stock) {
        toast.error(
          `Cannot add more items. Max stock available: ${data.product.stock}`,
          {
            position: "top-left",
          }
        );

        return;
      }

      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images?.[0]?.url || "",
        stock: data.product.stock,
        quantity: newQuantity,
      };

      setState((prevState) => {
        const isItemExist = prevState.cartItems.find(
          (item) => item.product === item.product
        );

        const updatedCartItems = prevState.cartItems.some(
          (cartItem) => cartItem.product === item.product
        )
          ? prevState.cartItems.map((cartItem) =>
              cartItem.product === item.product ? item : cartItem
            )
          : [...prevState.cartItems, item];

        return {
          ...prevState,
          cartItems: updatedCartItems,
        };
      });

      toast.success("Item Added to Cart", {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add item to cart",
        {
          position: "top-left",
        }
      );
    }
  };

  // Used only by Cart when changing + or -
  const updateCartQuantity = (id, quantity) => {
    setState((prevState) => ({
      ...prevState,

      cartItems: prevState.cartItems.map((item) =>
        item.product === id
          ? {
              ...item,
              quantity: quantity,
            }
          : item
      ),
    }));
  };

  const removeItemFromCart = (id) => {
    setState((prevState) => ({
      ...prevState,

      cartItems: prevState.cartItems.filter((item) => item.product !== id),
    }));
  };

  const saveShippingInfo = (data) => {
    setState((prevState) => ({
      ...prevState,

      shippingInfo: data,
    }));
  };

  return (
    <>
      <Router>
        <Header
          cartItems={state.cartItems}
          user={state.user}
          setUserData={setUserData}
        />

        <Routes>
          {/* Customer Routes */}

          <Route path="/" element={<Home />} />

          <Route
            path="/product/:id"
            element={<ProductDetails addItemToCart={addItemToCart} />}
          />

          <Route path="/search/:keyword" element={<Home />} />

          <Route path="/login" element={<Login setUserData={setUserData} />} />

          <Route path="/register" element={<Register />} />

          <Route path="/password/forgot" element={<ForgotPassword />} />

          <Route path="/password/reset/:token" element={<NewPassword />} />

          <Route path="/me" element={<Profile />} />

          <Route path="/me/update" element={<UpdateProfile />} />

          <Route path="/password/update" element={<UpdatePassword />} />

          <Route
            path="/cart"
            element={
              <Cart
                cartItems={state.cartItems}
                updateCartQuantity={updateCartQuantity}
                removeItemFromCart={removeItemFromCart}
              />
            }
          />

          <Route
            path="/shipping"
            element={
              <Shipping
                shipping={state.shippingInfo}
                saveShippingInfo={saveShippingInfo}
              />
            }
          />

          <Route
            path="/confirm"
            element={
              <ConfirmOrder
                cartItems={state.cartItems}
                shippingInfo={state.shippingInfo}
              />
            }
          />

          <Route
            path="/payment"
            element={
              <Payment
                cartItems={state.cartItems}
                shippingInfo={state.shippingInfo}
              />
            }
          />

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

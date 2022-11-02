import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

export default function App() {
  return (
    <>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/' element={<Navigate to='/login' />} />
        </Routes>
      </Suspense>
    </>
  )
}

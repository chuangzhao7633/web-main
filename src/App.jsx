import React, { Suspense, useState } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { appInitialRequest } from '@service/global';
import { loadLocales } from '@util/Utils';
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const [languageRes, setLanguageRes] = useState();

  const handleChange = language => {
    appInitialRequest(language, localLanguageRes => {
      loadLocales(localLanguageRes && localLanguageRes.data || {}, {});
      setLanguageRes(localLanguageRes && localLanguageRes.data);
    });
  }

  return (
    <>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route exact path='/login' element={<Login changeLanguage={handleChange} />} />
          <Route exact path='/register' element={<Register changeLanguage={handleChange} />} />
          <Route exact path='/' element={<Navigate to='/login' />} />
        </Routes>
      </Suspense>
    </>
  )
}

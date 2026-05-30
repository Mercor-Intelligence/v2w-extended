import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import PrenatalClasses from './pages/PrenatalClasses.jsx';
import ClassCalendar from './pages/ClassCalendar.jsx';
import BirthDoula from './pages/BirthDoula.jsx';
import BirthCoaching from './pages/BirthCoaching.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Shop from './pages/Shop.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes/prenatal" element={<PrenatalClasses />} />
        <Route path="/classes/calendar" element={<ClassCalendar />} />
        <Route path="/doula/birth" element={<BirthDoula />} />
        <Route path="/birth-coaching" element={<BirthCoaching />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

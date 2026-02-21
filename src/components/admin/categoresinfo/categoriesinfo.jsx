import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../../api/categoriesApi";

const CategoriesInfoPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Categories</h1>
      <ul>
        {categories?.map((category) => (
          <li key={category.id}>
            <Link to={`/admin/categories/${category.id}`}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesInfoPage;

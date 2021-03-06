import React, { useEffect, useReducer, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../App.jsx';
import Photos from './Photos.jsx';
import AllDetails from './AllDetails.jsx';

export const StyleContext = React.createContext();

const styleReducer = (state, action) => {
  switch (action.type) {
    case 'switchCurrentStyle':
      return {...state, currentStyle: state.allStyles[action.payload.id]}
    case 'newProduct':
      return {allStyles: action.payload.allStyles, currentStyle: action.payload.currentStyle};
    default:
      return state;
  }
}

const Product = () => {
  const [state, dispatch] = useReducer(styleReducer, {allStyles: {}, currentStyle: {}});
  const { productId } = useContext(AppContext);
  const { style_id } = useParams();

  function getStyles(product_id) {
    axios.get(`/api/products/${product_id}/styles`)
    .then(({ data }) => {
      let styleObj = {};
      let defaultStyle = data.results[0];
      data.results.forEach((style) => {
        styleObj[style.style_id] = style;
        if (style['default?']) defaultStyle = style;
      });
      dispatch({
        type: 'newProduct',
        payload: {
          allStyles: styleObj,
          currentStyle: style_id ? styleObj[style_id] : defaultStyle // check later if ternary is necessary
        }
      })
    })
    .catch((err) => console.error(err));
  }

  useEffect(() => {
    getStyles(productId);
  }, [productId]);

  if (!state.currentStyle || !Object.keys(state.currentStyle).length) {
    return <h3>Loading...</h3>
  } else {
    return (
      <StyleContext.Provider
        value={{ allStyles: state.allStyles, currentStyle: state.currentStyle, dispatch }}
      >

      <div className="product-overview">
        <Photos/>
        <AllDetails />
      </div>

      </StyleContext.Provider>
    )
  }

}

export default Product;
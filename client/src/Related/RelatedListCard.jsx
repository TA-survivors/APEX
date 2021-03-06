import React, { useState, useEffect, useContext, useRef } from 'react';
import ComparisonModal from './ComparisonModal.jsx';
import axios from 'axios';
import AvgRating from '../Shared/AvgRating.jsx';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Modal from '@mui/material/Modal';
import { Link } from 'react-router-dom';
import { AppContext } from '../App.jsx';

const RelatedListCard = ({ relatedId, currentProductDetails, currentProductImg }) => {
  const [relatedProduct, updateRelatedProduct] = useState({ info: {} });
  const [relatedImgUrl, updateRelatedImgUrl] = useState({ img: {} });
  const [salePrice, updateSalePrice] = useState({ sale: {} });
  const [rating, updateRating] = useState({ rating: {} });
  const [numberOfStyles, updateNumberOfStyles] = useState(1);
  const [showModal, setShowModal] = useState(false);

  function getRelatedProductsInfo(relatedId) {
    axios.get(`/api/products/${relatedId}`)
      .then(({ data }) => updateRelatedProduct(data))
      .then(() => {
        axios.get(`/api/products/${relatedId}/styles`)
          .then(({ data }) => {
            let defaultStyle = data.results[0];
            for (let i = 1; i < data.results.length; i++) {
              if (data.results[i]['default?'] === true) {
                defaultStyle = data.results[i]
              }
            }
            if (defaultStyle.photos[0].thumbnail_url !== null) {
              updateRelatedImgUrl(defaultStyle.photos[0].thumbnail_url)
            } else {
              updateRelatedImgUrl('https://netmechanics.ca/wp-content/uploads/2019/04/you-almost-got-me-almost.jpg')
            }
            updateSalePrice(defaultStyle)
            updateNumberOfStyles(data.results.length)
          })
          .catch(err => console.error(err));
      })
      .then(() => {
        axios.get(`/api/products/${relatedId}/reviews/meta`)
          .then(({ data }) => updateRating(data.ratings))
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }

  useEffect(() => {
    getRelatedProductsInfo(relatedId)
  }, [])

  const handleChange = () => {
    setShowModal(!showModal)
    console.log(currentProductImg)
  }

  function hasSalePrice() {
    if (salePrice.sale_price === null) {
      return (
        <>
          <div className="related-price">${salePrice.original_price}</div>
        </>
      )
    } else {
      return (
        <>
          <div className="related-price" style={{ textDecoration: "line-through", fontWeight: '100' }}>${salePrice.original_price}</div>
          <div className="sale-price" style={{color: 'RGBA(255,0,0,0.8)'}}>${salePrice.sale_price}</div>
        </>
      )
    }
  }

  function numStyles() {
    if (numberOfStyles === 1) {
      return (
        <>
          1 Style
        </>
      )
    } else {
      return (
        <>
          {numberOfStyles} Styles
        </>
      )
    }
  }

  return (
    <div className="related-card">
      <Link to={`/products/${relatedId}/${salePrice.style_id}`}>
        <img src={relatedImgUrl} alt="" className="related-product-image"/>
      </Link>
      <div className="related-avg-rating-title">
        <AvgRating metaDataRatings={rating} />
      </div>
      <h2 className="related-name">{relatedProduct.name}</h2>
      <h4 className="related-category-styles">
        {relatedProduct.category}
        <br></br>
        {numStyles()}
        </h4>
      {hasSalePrice()}
      {/* <a className="new-comparison-open"><StarBorderIcon onClick={handleChange}/> </a> */}
      <StarBorderIcon className="related-comparison-open" onClick={handleChange}/>
      <Modal open={showModal} onClose={handleChange} className="comparison-modal">
        <ComparisonModal
          relatedProduct={relatedProduct}
          currentProduct={currentProductDetails}
          relatedImg={relatedImgUrl}
          currentProductImg={currentProductImg}
          handleChange={handleChange}/>
      </Modal>
    </div>
  )
}

export default RelatedListCard;
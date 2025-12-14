import ChopNowLogo from './ChopNowLogo.svg';
import bg from './bg.png';
import pointing from './pointing.png';
import fresh_produce from './fresh_produce.png';
import login_bg from './login_bg.png';
import google from './google.svg'
import bakery_image from './bakery_image.png';
import dairy_product_image from './dairy_product_image.png';
import drinks from './drinks.png';
import fresh_fruits_image from './fresh_fruits_image.png';
import grain_image from './grain_image.png';
import maggi_image from './maggi_image.png';
import organic_vegitable_image from './organic_vegitable_image.png'; 

export const assets = {
    ChopNowLogo,
    bg,
    pointing,
    fresh_produce,
    login_bg,
    google,
}

export const categories = [
    {
        text: 'Organic Veggies',
        path: 'Vegetables',
        image: organic_vegitable_image,
        bgColor: "#FEF6DA"
    },
    {
        text: 'Fresh Fruits',
        path: 'Fruits',
        image: fresh_fruits_image,
        bgColor: "#FEE0E0"
    },
    {
        text: 'Drinks',
        path: 'Drinks',
        image: drinks,
        bgColor: '#F0F5DE'
    },
    {
    text: "Instant Food",
    path: "Instant",
    image: maggi_image,
    bgColor: "#E1F5EC",
  },
  {
    text: "Dairy Products",
    path: "Dairy",
    image: dairy_product_image,
    bgColor: "#FEE6CD",
  },
  {
    text: "Bakery & Breads",
    path: "Bakery",
    image: bakery_image,
    bgColor: "#E0F6FE",
  },
  {
    text: "Grains & Cereals",
    path: "Grains",
    image: grain_image,
    bgColor: "#F1E3F9",
  },
];
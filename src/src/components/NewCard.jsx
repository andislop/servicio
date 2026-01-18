// src/components/NewsCard.jsx
import React from 'react';

const NewCard = ({ news }) => {
return (
    <div className="min-w-[300px] snap-center bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
    <img 
        src={news.url} 
        alt={news.title} 
        className="w-full h-48 object-cover" 
    />
    <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-gray-800">
            {news.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {news.description}
        </p>
    </div>
    </div>
);
};

export default NewCard;
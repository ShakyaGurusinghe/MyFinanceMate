/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-pattern */
import React from 'react'
import {
    LuUtensils,
    LuTrendingUp,
    LuTrendingDown,
    LuTrash2,
} from "react-icons/lu";

const TransactionInfoCard = ({
    title,
    icon,
    date,
    amount,
    type,
    hideDeleteBtn,
}) => {
  return <div className=''>
    <div className=''>
      {icon ? (
        <img src={icon} alt={title} className=''/>
      ) : (
        <LuUtensils/>
      )}  
    </div>
  </div>;
};

export default TransactionInfoCard

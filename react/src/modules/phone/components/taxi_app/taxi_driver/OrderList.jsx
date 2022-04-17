import React from 'react';
import styles from '../taxi.module.scss';
import Order from "./Order";


const OrderList = ({orders, takeOrder}) => {
    return (
        <div className={styles.list}>
            {orders.map((order, index) => <Order info={order} key={index} takeOrder={takeOrder}/>)}
        </div>
    )
};

export default OrderList;
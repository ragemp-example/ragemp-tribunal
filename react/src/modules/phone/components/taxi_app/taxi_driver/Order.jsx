import React from 'react';
import styles from '../taxi.module.scss';
import point from '@imgs/phone/taxi_app/point.svg';
import styled from 'styled-components';


export const Button = styled.div.attrs(props => ({
    onClick: !props.disabled && props.onClick
}))`
  background-color: #FFD914;
  color: black;
  padding: 0.5em 1em;
  box-sizing: border-box;
  font-weight: 500;
  transition: 0.15s ease-in-out;
  text-align: center;
  opacity: ${props => props.disabled && '0.5'};
  
  &:hover {
    filter: ${props => !props.disabled && 'brightness(0.9)'};
  }
`;

const Order = ({ info, takeOrder }) => {
    const take = (id) => {
        takeOrder(id);

        // eslint-disable-next-line no-undef
        mp.trigger('taxi.driver.app.order.take', id);
    };

    return (
        <div className={styles.order}>
            <div>
                <img src={point} />
                <span>{info.distance} км</span>
            </div>
            <Button onClick={() => take(info.id)}>Принять</Button>
        </div>
    );
};

export default Order;
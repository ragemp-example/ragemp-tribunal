import React from 'react';

import styled from 'styled-components';
import {back} from './icons';

export function formatPrice(_number) {
    let decimal=0;
    let separator=' ';
    let decpoint = '.';
    let format_string = '#';

    let r=parseFloat(_number)

    let exp10=Math.pow(10,decimal);// приводим к правильному множителю
    r=Math.round(r*exp10)/exp10;// округляем до необходимого числа знаков после запятой

    let rr=Number(r).toFixed(decimal).toString().split('.');

    let b=rr[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1"+separator);

    r=(rr[1]?b+ decpoint +rr[1]:b);
    return format_string.replace('#', r);
}

export function formatNumber(_number) {
    let fullNumber = String('00000000' + _number).slice(-8);
    let first4 = fullNumber.slice(0, 4);
    return fullNumber.replace(first4, first4 + ' ')
}

export const Button = styled.button`
  color: white;
  background: ${props => props.secondary ? 'transparent' : 'linear-gradient(90deg, #56AB2F 0%, #A8E063 100%)'};
  box-shadow: 0px 15px 25px rgba(0, 0, 0, 0.15);
  transition: 0.15s ease-in-out;
  padding: 1em 3em;
  outline: none;
  border: ${props => props.secondary ? '1px solid #56AB2F' : 'none'};;
  border-radius: 0.6em;
  margin-top: 0.3em;
  font-size: 1.1em;
  min-width: 12em;
  
  &:hover {
    box-shadow: none;
  }
`;

export const Input = styled.div`
  //text-align: left;
  width: auto;
  margin-bottom: 1em;

  & p {
    margin: 0;
    font-weight: 500;
    margin-bottom: 0.5em;
    //text-align: left;
  }
  
  & input {
    outline: none;
    border: 1px solid transparent;
    font-size: 1.1em;
    padding: 0.8em 1em;
    box-sizing: border-box;
    background-color: #EBEBEB;
    border-radius: 0.4em;
    
    &::placeholder {
      color: #BFBFBF;
    }
  }
`;

export const Back = styled.div`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  border-radius: 5em;
  width: 7em;
  height: 3em;
  background-color: white;
  transition: 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 3%;
  
  & img {
    width: 50%;
  }
  
  &:hover {
    box-shadow: none;
  }
`;

export const BackButton = ({onClick}) => {
    return (
        <Back onClick={onClick}>
            <img src={back} />
        </Back>
    )
};
import React from 'react';
import styled from 'styled-components';


export const Container = styled.div`
  width: 92%;
  margin-left: 4%;
  margin-top: 2%;
`;

export const Button = styled.div`
  //width: 100%;
  background-color: ${props => props.cancel ? '#3F1212' : '#12193F'};
  color: white;
  padding: 1em 0.5em;
  border-radius: 0.2em;
  text-align: center;
  margin-top: 4%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in-out;
  
  &:hover {
    background-color: ${props => props.cancel ? '#802626' : '#0E1330'};
  }
`;

export const Input = styled.input.attrs(props => ({disabled: props.disabled}))`
  font-size: 1em;
  color: white;
  background-color: ${props => props.disabled ? 'rgba(15,17,38,0.87)' : '#090C1E'};
  padding: 0.6em 0.9em;
  box-sizing: border-box;
  width: 100%;
  border-radius: 0.2em;
  margin-top: 0.5em;
  outline: none;
  border: ${props => props.error ? '0.1em solid #FF8D8D' : '0.1em solid #090C1E'};
  
  &::placeholder {
    color: rgba(255,255,255,0.51);
  }
`;

export const Header = styled.div`
  background: #12193F;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.25);
  color: white;
  text-align: center;
  padding: 2.5em 1em 0.5em 1em;
  //height: 13%;
  font-size: 1.1em;
  position: relative;
  
  & span {
    display: block;
    margin-top: 0.4em;
    font-size: 0.8em;
    color: rgba(255,255,255,0.5);
    font-weight: 300;
  }
  
  & img {
    width: 9%;
    position: absolute;
    left: 5%;
    top: 55%;
  }
`;

export const ManageIcon = styled.div`
  width: 2em;
  height: 2em;
  color: ${props => props.color};
  background-color: #12193F;
  border-radius: 50%;
  padding: 0.2em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
`;

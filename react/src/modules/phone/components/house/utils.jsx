import React from 'react';
import styled from 'styled-components';


export const Container = styled.div`
  width: 90%;
  margin-left: 5%;
  margin-top: 5%;
`;

export const Button = styled.div`
  //width: 100%;
  background-color: ${props => props.primary ? '#2174E8' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#2174E8'};
  border: 0.2em solid #2174E8;
  padding: 0.7em 0.5em;
  border-radius: 0.5em;
  text-align: center;
  margin-top: 2%;
  display: flex;
  align-items: center;
  justify-content: center;

  & img {
    width: 8%;
    margin-left: 0.5em;
  }
`;

export const Input = styled.input`
  font-size: 1em;
  background-color: #EFEFEF;
  padding: 0.6em 0.9em;
  box-sizing: border-box;
  width: 100%;
  border-radius: 2em;
  margin-top: 0.5em;
  outline: none;
  border: ${props => props.error ? '0.1em solid #E51414' : '0.1em solid #EFEFEF'}
`;

export const Header = styled.div`
  background: linear-gradient(180deg, #00D2FF 0%, #2174E8 100%);
  color: white;
  text-align: center;
  padding: 2.5em 1em 1em 1em;
  height: 13%;
  font-size: 1.3em;
  
  & span {
    display: block;
    font-size: 0.9em;
  }
`;
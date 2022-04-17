import React, {useState} from 'react';
import {connect} from 'react-redux';
import {closeApp} from "../../actions/apps.actions";
import styles from '../../phone.module.scss';
import styled from 'styled-components';
import logo from '../../../../imgs/phone/news_logo.png';


const MAX_LENGTH_MESSAGE = 80;


const TextArea = styled.textarea.attrs(props => ({
    maxLength: props.maxLength,
    resize: 'none',
    rows: 7,
    value: props.value,
    onChange: props.onChange,
    placeholder: props.placeholder
}))`
  font-size: 1em;
  margin-top: 0.5em;
  background-color: #EAEAEA;
  outline: none;
  border-radius: 0.7em;
  padding: 1em;
  box-sizing: border-box;
  width: 100%;
  font-family: Roboto;
  border: ${props => props.error ? '1px solid #F51B1B' : '1px solid #E0E0E0'};
  color: black;
  
  &::placeholder {
    color: #858585;
  }
`;

const Container = styled.div`
  width: 86%;
  margin-left: 7%;
  margin-top: 3em;
  
  & img {
    width: 70%;
  }
  
  & p {
    margin-bottom: 0;
    color: #969696;
  }
`;

const Symbols = styled.p`
  color: #858585;
  margin-top: 0.5em;
  //margin-left: 0.5em;
`;

const Button = styled.div.attrs(props => ({
    onClick: props.onClick
}))`
  color: white;
  border-radius: 2em;
  margin-top: 3em;
  text-align: center;
  font-size: 1em;
  background: #F51B1B;
  padding: 1em;
  box-sizing: border-box;
  transition: 0.1s ease-in-out;
  
  &:hover {
    filter: brightness(0.8);
  }
`;


const News = ({ info, closeAppAction }) => {
    const [message, setMessage] = useState('');

    const send = () => {
        if (!message || (message.length > MAX_LENGTH_MESSAGE)) return;

        // eslint-disable-next-line no-undef
        mp.trigger('callRemote', 'mapCase.news.ads.add', message);
        setMessage('');
    };

    return (
        <div className={[styles.app, styles.newsApp].join(' ')}>
            <Container>
                <div style={{ textAlign: 'center' }}>
                    <img src={logo} />
                </div>
                <p>Текст объявления:</p>
                <TextArea
                    placeholder={'Введите сообщение...'}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={MAX_LENGTH_MESSAGE}
                    error={!message || message.length > MAX_LENGTH_MESSAGE}

                />
                <p>Введено символов:</p>
                <span>{message.length}/{MAX_LENGTH_MESSAGE}</span>
                <p>Стоимость отправки:</p>
                <span>$ {message.length*info.symbolPriceNews}</span>
                <Button onClick={send}>Подать объявление</Button>
            </Container>
        </div>
    );
}

const mapStateToProps = state => ({
    info: state.info
});

const mapDispatchToProps = dispatch => ({
    closeAppAction: () => dispatch(closeApp())
});

export default connect(mapStateToProps, mapDispatchToProps)(News);
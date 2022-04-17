import React, {useState} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import styles from '../../phone.module.scss';
import {Header, Title} from "../contacts/CreateContact";
import back_icon from '@imgs/phone/back_icon.svg';
import call_icon from '@imgs/phone/call_icon.svg';
import {closeApp} from '@phone/actions/apps.actions';

const MAX_LENGTH_MESSAGE = 60;


const TextArea = styled.textarea.attrs(props => ({
    maxLength: props.maxLength,
    resize: 'none',
    rows: 5,
    value: props.value,
    onChange: props.onChange,
    placeholder: props.placeholder
}))`
  font-size: 1em;
  margin-top: 1em;
  background-color: #EFEFEF;
  outline: none;
  border-radius: 0.7em;
  padding: 1em;
  box-sizing: border-box;
  width: 100%;
  font-family: Roboto;
  border: ${props => props.error ? '1px solid red' : '1px solid transparent'};
  
  &::placeholder {
    color: #858585;
  }
`;

const Symbols = styled.p`
  color: #858585;
  margin-top: 0.5em;
  //margin-left: 0.5em;
`;

const Container = styled.div`
  width: 90%;
  margin-left: 5%;
`;

const Button = styled.div.attrs(props => ({
    onClick: props.onClick
}))`
  color: white;
  border-radius: 0.6em;
  margin-top: 0.6em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1em;
  background: ${props => props.background};
  padding: 1em;
  box-sizing: border-box;
  transition: 0.1s ease-in-out;
  
  & img {
    width: 13%;
  }
  
  &:hover {
    filter: brightness(0.8);
  }
`;

const EmergencyCall = ({closeAppAction}) => {
    const [text, setText] = useState('');

    const send = (type) => {
        if (!text || (text.length > MAX_LENGTH_MESSAGE)) return;

        // eslint-disable-next-line no-undef
        mp.trigger('callRemote', `mapCase.${type}.calls.add`, text);
        closeAppAction();
    };

    return (
        <div className={styles.app}>
            <div className={styles.container}>
                <Header>
                    <span className={styles.back} onClick={closeAppAction}>
                        <img src={back_icon}/>
                        <span>Назад</span>
                    </span>
                </Header>
                <Title style={{marginTop: '0em'}}>Экстренный вызов</Title>
                <TextArea
                    maxLength={MAX_LENGTH_MESSAGE}
                    placeholder={'Введите причину...'}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    error={!text || text.length > MAX_LENGTH_MESSAGE}
                />
                <Container>
                    <Symbols>Символов: {MAX_LENGTH_MESSAGE - text.length}/{MAX_LENGTH_MESSAGE}</Symbols>
                    <p>Выберите службу<br/> для вызова из списка</p>
                    <Button
                        onClick={() => send('pd')}
                        background={'radial-gradient(18.45% 84.44% at 68.45% 94.44%, rgba(36, 0, 255, 0.25) 0%, rgba(36, 0, 255, 0) 100%), radial-gradient(20.87% 95.56% at 29.13% 100%, rgba(255, 5, 5, 0.25) 0%, rgba(255, 0, 0, 0) 100%), #040D23'}
                    >
                        <img src={call_icon}/>
                        <span>Позвонить в PD</span>
                    </Button>
                    <Button
                        background={'#FD3535'}
                        onClick={() => send('ems')}
                    >
                        <img src={call_icon}/>
                        <span>Позвонить в EMS</span>
                    </Button>
                </Container>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    closeAppAction: () => dispatch(closeApp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EmergencyCall);
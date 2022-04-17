import React, {useState} from 'react';
import styled from 'styled-components';
import styles from '@phone/phone.module.scss';
import back_icon from '@imgs/phone/back_icon.svg';
import {connect} from "react-redux";
import {updateContact, addContact} from "@phone/actions/contacts.actions";
import {closeApp} from "@phone/actions/apps.actions";

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2496FF;
  padding: 1em 0;
  
  p {
    width: 45%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 0;
    text-align: right;
  }
`;

export const Title = styled.h1`
  font-size: 1.7em;
`;

export const Input = styled.input`
    width: 90%;
    font-family: roboto;
    font-size: 1em;
    border: ${props => props.error ? '1px solid red' : 'none'};
    background-color: #EFEFEF;
    border-radius: 2rem;
    padding: 0.5em 0.7em;
    margin-bottom: 1em;
`;

const CreateContact = ({
    defaultContact,
    updatePage,
    closeAppAction,
    addContactAction,
    updateContactAction,
    contacts
}) => {
    const [name, setName] = useState(defaultContact ? defaultContact.name : '');
    const [number, setNumber] = useState(defaultContact ? defaultContact.number : '');
    const [error, setError] = useState({});

    const setNumberCheck = value => {
        if (Number(value) || value === '') setNumber(value);
    };

    const checkContacts = (field, value) => (contacts.find(contact => contact[field] == value));

    const add = () => {
        if (!name) return setError({ name: 'Не все поля заполнены' });
        setError({ ...error, name: null });

        if (!number) return setError({ number: 'Не все поля заполнены' });
        setError({ ...error, number: null });

        if (checkContacts('number', number)) return setError({ number: 'Контакт с таким номером уже есть' });
        setError({ ...error, number: null });

        if (checkContacts('name', name)) return setError({ name: 'Контакт с таким именем уже есть' });
        setError({ ...error, name: null });

        // eslint-disable-next-line no-undef
        mp.trigger('phone.contact.add', name, number);

        addContactAction(number, name);
        closeAppAction();
    };

    const update = () => {
        if (!name) return setError({ name: 'Не все поля заполнены' });
        setError({ ...error, name: null });

        if (checkContacts('name', name) && name !== defaultContact.name ) return setError({ name: 'Контакт с таким именем уже есть' });
        setError({ ...error, name: null });

        // eslint-disable-next-line no-undef
        mp.trigger('phone.contact.rename', defaultContact.number, name);

        updateContactAction(defaultContact.number, name);
        closeAppAction();
    };

    return (
        <div className={[styles.app, styles.createContact].join(' ')}>
            <div className={styles.container}>
                <Header>
                    <span className={styles.back} onClick={closeAppAction}>
                        <img src={back_icon}/>
                        <span>Контакты</span>
                    </span>
                    <p onClick={updatePage ? update : add}>Сохранить</p>
                </Header>
                <Title>{updatePage ? 'Редактирование' : 'Создать контакт'}</Title>
                <Input
                    placeholder='Имя'
                    value={name}
                    maxLength={25}
                    onChange={e => setName(e.target.value)}
                    error={error.name}
                />
                {   !updatePage &&
                    <Input
                        placeholder='Номер телефона'
                        value={number}
                        maxLength={10}
                        onChange={e => setNumberCheck(e.target.value)}
                        error={error.number}
                    />
                }
                <div className={styles.error}>{ error.name || error.number }</div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
   contacts: state.info.contacts
});

const mapDispatchToProps = dispatch => ({
   closeAppAction: () => dispatch(closeApp()),
    addContactAction: (number, name) => dispatch(addContact(number, name)),
    updateContactAction: (number, newName) => dispatch(updateContact(number, newName))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateContact);
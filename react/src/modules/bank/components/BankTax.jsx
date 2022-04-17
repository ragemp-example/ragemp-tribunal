import React, {Fragment, useState} from 'react';
import {Button, formatPrice} from "./utils";
import styles from '../styles/Bank.module.scss';

const BankTax = ({house, biz, bank, pay, setError, none, title}) => {
    const [selectedDays, setSelectedDays] = useState(0);

    const onChangeDays = value => {
        if (isNaN(value)) return;

        setSelectedDays(parseInt(value) || '')
    };

    const increment = () => {
        let selected = selectedDays || 0;

        if (selected >= (30 - (house || biz).days)) return setError(`Вы можете оплатить максимум ${(30 - (house || biz).days)} дней`);
        setError('');

        setSelectedDays(selected + 1);
    };

    const decrement = () => {
        let selected = selectedDays || 0;

        if (selected < 1) return;

        setSelectedDays(selected - 1);
    };

    const validate = (info, money) => {
        if (selectedDays === 0 || parseInt(selectedDays) < 1) return setError('Количество дней не выбрано');
        setError('');

        if (selectedDays > (30 - info.days)) return setError(`Вы можете оплатить максимум ${(30 - info.days)} дней`);
        setError('');

        if (money < (selectedDays*info.rent)) return setError('Недостаточно денежных средств');
        setError('');

        pay(selectedDays);
    };

    const getInfo = (info) => {
        if (info.type) {
            return (
                <div className={styles.taxInfo}>
                    <p>Бизнес: <span>{info.name}</span></p>
                    <p>Тип: <span>{info.type}</span></p>
                    <p>Налог: <span>${info.rent} в день</span></p>
                    <p>Оплачено: <span>{info.days}/30</span></p>
                </div>
            )
        }

        return (
            <div className={styles.taxInfo}>
                <p>Дом: <span>{info.name}</span></p>
                <p>Класс: <span>{info.class}</span></p>
                <p>Квартплата: <span>${info.rent} в день</span></p>
                <p>Оплачено: <span>{info.days}/30</span></p>
            </div>
        )
    };

    return (
        <div className={styles.tax}>
            <h1 className={styles.taxTitle}>{title}</h1>
            {
                none
                ? <h1 className={styles.title} style={{ marginTop: '3em' }}>{none}</h1>
                : <Fragment>
                        {getInfo(house || biz)}
                        <div className={styles.taxDays}>
                            <span onClick={decrement}><b>-</b></span>
                            <input
                                value={selectedDays}
                                maxLength={2}
                                onChange={e => onChangeDays(e.target.value)}
                            />
                            <span onClick={increment}><b>+</b></span>
                        </div>
                        <div className={styles.total}>Итого: <span>${formatPrice(selectedDays*((house || biz).rent))}</span></div>
                        <Button onClick={() => validate(house || biz, bank.money)} style={{ marginTop: '0.8em' }}>
                            Оплатить
                        </Button>
                    </Fragment>
            }
        </div>
    );
};

export default BankTax;
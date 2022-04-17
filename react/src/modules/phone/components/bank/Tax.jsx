import React, {useState} from 'react';
import {connect} from 'react-redux';
import styles from './BankApp.module.scss';
import Header from "./Header";
import {Button, Container, formatPrice} from "./utils";
import {addApp} from "../../actions/apps.actions";
import Confirm from "./Confirm";

const Tax = ({house, biz, bankApp, addAppAction}) => {
    const [selectedDays, setSelectedDays] = useState(0);
    const [error, setError] = useState('');

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

    const pay = () => {
        if (biz) {
            const name = `${biz.type} "${biz.name}"`;

            addAppAction(<Confirm info={{ type: 'biz', sum: selectedDays*biz.rent, name, id: biz.id, days: selectedDays }} />);
        }

        if (house) {
            const name = `Дом ${house.name}`;

            addAppAction(<Confirm info={{ type: 'house', sum: selectedDays*house.rent, name, id: house.name, days: selectedDays }} />);
        }
    };

    const validate = (info, money) => {
        if (selectedDays === 0 || parseInt(selectedDays) < 1) return setError('Количество дней не выбрано');
        setError('');

        if (selectedDays > (30 - info.days)) return setError(`Вы можете оплатить максимум ${(30 - info.days)} дней`);
        setError('');

        if (money < (selectedDays*info.rent)) return setError('Недостаточно денежных средств');
        setError('');

        pay();
    };

    const getInfo = (info) => {
        if (info.type) {
            return (
                <div className={styles.taxInfo}>
                    <p>{info.type} "{info.name}"</p>
                    <span>{info.area}</span>
                    <p style={{ margin: 0, fontSize: '1em' }}>${info.rent} в день</p>
                </div>
            )
        }

        return (
            <div className={styles.taxInfo}>
                <p>Дом {info.name}</p>
                <span>{info.area}</span>
                <p style={{ margin: 0, fontSize: '1em' }}>${info.rent} в день</p>
            </div>
        )
    };

    return (
        <div className={styles.back}>
            <Header/>
            <Container>
                <h1 className={styles.title}>Налог на {house ? 'дом' : 'бизнес'}</h1>
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
                <div className={styles.error}>{error}</div>
                <Button onClick={() => validate(house || biz, bankApp.money)} style={{ bottom: '5%' }}>
                    Оплатить
                </Button>
            </Container>
        </div>
    );
};

const mapStateToProps = state => ({
    bankApp: state.bankApp
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app))
});

export default connect(mapStateToProps, mapDispatchToProps)(Tax);
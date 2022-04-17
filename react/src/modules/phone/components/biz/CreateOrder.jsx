import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import Header from "./Header";
import {addApp, closeApp} from "../../actions/apps.actions";
import AnsOrder from "./AnsOrder";
import {setOrderStatusBusiness} from "../../actions/biz.actions";
import styles from './Biz.module.scss';
import {Button, Container, Input} from "./utils";
import {create_order} from "./icons";


class CreateOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            productCount: '',
            productPrice: '',
            errorCount: '',
            errorPrice: ''
        };

        this.getContent = this.getContent.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.createOrder = this.createOrder.bind(this);
        this.validatePrice = this.validatePrice.bind(this);
    }

    validateCount(count) {
        if (count) {
            if (!isNaN(count)) {
                this.setState({ errorCount: '' });
                return true;
            } else {
                this.setState({ errorCount: 'Некорректное значение', productCount: '' });
                return false;
            }
        } else {
            this.setState({ errorCount: 'Поле не заполнено', productCount: '' });
            return false;
        }
    }

    validatePrice(price) {
        const { business } = this.props;

        if (price) {
            if (!isNaN(price) && parseFloat(price) <= business.resourcePriceMax && parseFloat(price) >= business.resourcePriceMin) {
                this.setState({ errorPrice: '' });
                return true;
            } else {
                this.setState({ errorPrice: 'Некорректное значение', productPrice: '' });
                return false;
            }
        } else {
            this.setState({ errorPrice: 'Поле не заполнено', productPrice: '' });
            return false;
        }
    }

    validateForm() {
        const { productCount, productPrice } = this.state;

        let h = true;

        if (!this.validateCount(productCount)) {
            h = false;
        }

        // if (!this.validatePrice(productPrice)) {
        //     h = false;
        // }

        return h;
    }

    handleChangeInput(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    createOrder() {
        const { addApp, setOrderStatus, apps, business } = this.props;
        const { productCount, productPrice } = this.state;

        if (this.validateForm() && !apps.some(app => app.name === 'AnsOrder')) {
            addApp({ name: 'AnsOrder', form: <AnsOrder
                    productsCount={parseInt(productCount)} productsPrice={business.resourcePriceMin}
                /> });

            // eslint-disable-next-line no-undef
            mp.trigger('biz.order.add', business.id, parseInt(productCount), business.resourcePriceMin);

            // setTimeout(() => {
            //     setOrderStatus(1);
            // }, 1000)
        }
    }

    getContent(business) {
        const { closeApp } = this.props;
        const { productCount, productPrice, errorCount, errorPrice } = this.state;

        return (
            <Container>
                <h1 className={styles.title}>Создание заказа</h1>

                <label>Количество товара</label>
                <Input
                    placeholder='Введите количество'
                    onChange={e => this.setState({ productCount: e.target.value })}
                    error={errorCount}
                    value={productCount}
                />
                <label>Цена за товар</label>
                <Input
                    placeholder='Введите цену'
                    onChange={e => this.setState({ productPrice: e.target.value })}
                    error={errorPrice}
                    value={business.resourcePriceMin}
                    disabled
                />

                {/*<div style={{ marginTop: '5%', opacity: 0.75 }}>*/}
                {/*    <div>Минимальная цена - <span style={{ color: '#45C34A' }}>${business.resourcePriceMin}</span></div>*/}
                {/*    <div>Максимальная цена - <span style={{ color: '#45C34A' }}>${business.resourcePriceMax}</span></div>*/}
                {/*</div>*/}

                <div className={styles.sellImage} style={{ marginTop: '5%'}}>
                    <img src={create_order} style={{ width: '40%' }} />
                </div>

                <div className={styles.buttonsBlock}>
                    <Button onClick={this.createOrder}>
                        Заказать
                    </Button>
                </div>
            </Container>
        )
    }

    render() {

        const { business } = this.props;

        return (
            <div className={styles.back}>
                <Header business={business}/>

                {
                    this.getContent(business)
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0],
    apps: state.apps
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp()),
    addApp: app => dispatch(addApp(app)),
    setOrderStatus: status => dispatch(setOrderStatusBusiness(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrder);

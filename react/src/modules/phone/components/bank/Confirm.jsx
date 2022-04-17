import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import styles from "./BankApp.module.scss";
import Header from "./Header";
import {Button, Container} from "./utils";
import Loader from "../Loader";
import {addApp} from "../../actions/apps.actions";
import Error from "./Error";
import Answer from "./Answer";
import {setAnswerBankApp, taxesBizBankApp, taxesHouseBankApp, transferBankApp} from "../../actions/bankApp.actions";


const Confirm = ({info, bankApp, addAppAction, transferAction, taxesHouseAction, taxesBizAction}) => {
    const onSuccessTransfer = () => transferAction(parseInt(info.sum));
    const onSuccessTaxesHouse = () => taxesHouseAction(parseInt(info.sum), parseInt(info.days), parseInt(info.id));
    const onSuccessTaxesBiz = () => taxesBizAction(parseInt(info.sum), parseInt(info.days), parseInt(info.id));

    const pay = () => {
        // eslint-disable-next-line no-undef
        mp.trigger(`bank.${info.type}.push`, info.id, parseInt(info.days));

        addAppAction(
            <Answer
                taxes
                info={{
                    days: info.days,
                    sum: info.sum,
                    name: info.name,
                }}
                onSuccess={info.type === 'biz' ? onSuccessTaxesBiz : onSuccessTaxesHouse}
            />
        )
    };

    const transfer = () => {
        // eslint-disable-next-line no-undef
        mp.trigger('bank.transfer');

        addAppAction(
            <Answer
                info={{
                    name: bankApp.askAnswer.nick,
                    sum: info.sum
                }}
                onSuccess={onSuccessTransfer}
            />
        )
    };

    const getAsk = () => {
        if (info.type === 'transfer') {
            return (
                <p>
                    Подтвердите, что вы согласны перевести <b>${info.sum}</b> человеку <b>{bankApp.askAnswer.nick}</b>
                </p>
            )
        }

        if (info.type === 'biz' || info.type === 'house') {
            return (
                <p>
                    Подтвердите, что вы согласны оплатить <b>{info.days}</b> дней налогообложения <b>{info.name}</b>
                </p>
            )
        }
    };

    const getPage = () => {
      return (
          <Container>
              <h1 className={styles.title} style={{fontSize: '1.7em'}}>Подтверждение</h1>
              {info && getAsk()}
              <Button onClick={info.type === 'transfer' ? transfer : pay}>
                  Подтвердить
              </Button>
          </Container>
      )
    };

    const getConfirmByType = type => {
        if (type === 'transfer') {
            if (bankApp.askAnswer) {
                if (bankApp.askAnswer.nick) {
                    return getPage()
                } else {
                    addAppAction(<Error text='Человек с таким номером счета не найден'/>);
                    return <div />
                }
            } else return <Loader color='#56AB2F' />
        } else return getPage();
    };

    return (
        <div className={styles.back}>
            <Header/>
            { getConfirmByType(info.type) }
        </div>
    );
};

const mapStateToProps = state => ({
    bankApp: state.bankApp
});

const mapDispatchToProps = dispatch => ({
    addAppAction: app => dispatch(addApp(app)),
    setAnswerAction: answer => dispatch(setAnswerBankApp(answer)),
    transferAction: money => dispatch(transferBankApp(money)),
    taxesHouseAction: (money, days, id) => dispatch(taxesHouseBankApp(money, days, id)),
    taxesBizAction: (money, days, id) => dispatch(taxesBizBankApp(money, days, id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Confirm);
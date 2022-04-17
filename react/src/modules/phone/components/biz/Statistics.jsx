import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {closeApp} from "../../actions/apps.actions";
import Header from "./Header";
import styles from './Biz.module.scss';
import {info} from './icons';
import {Container} from "./utils";

class Statistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPage: 1
        };

        this.getTableBody = this.getTableBody.bind(this);
    }

    getTableBody() {
        const { business } = this.props;
        const { selectedPage } = this.state;

        return (
            business.statistics.map((day, index) => (
                ((index / 6 < selectedPage) && (index / 6) > selectedPage - 1)
                && this.getTableRow(day, index)
            ))
        )
    }

    getTableRow(day, index) {
        return (
            <tr key={index}>
                <th>{this.getDateStatistics(new Date(day.date))}</th>
                <th style={{ color: '#55af14' }}>{day.money}$</th>
            </tr>
        )
    }

    getDateStatistics(date) {
        return `${String('00' + date.getDate()).slice(-2)}.${String('00' + Number(date.getMonth() + 1)).slice(-2)}`
    }

    getNavigatePanel() {
        const { business } = this.props;
        const { selectedPage } = this.state;

        let pages = [];
        let pagesCount = business.statistics.length / 6;

        for (let i = 1; i < pagesCount + 1; i++) {
            pages.push(i);
        }

        return (
            <div className='navigate_panel_stat-phone-react'>
                {
                    pages.map(page => (
                        <div style={{
                            fontSize: selectedPage == page ? '150%' : '110%',
                            marginTop: selectedPage == page && '3%'
                        }}
                             onClick={() => this.setState({ selectedPage: page })}
                        >
                            { page }
                        </div>
                    ))
                }
            </div>
        )
    }

    render() {
        const { business, closeApp } = this.props;
        const { selectedPage } = this.state;

        return (
            <div className={styles.back}>
                <Header title='Финансовая статистика'/>
                <Container>
                    <div className={styles.statistics}>
                        {
                            business.statistics && business.statistics.length !== 0
                            ? business.statistics.map((day, index) => (
                                <div className={styles.statisticBlock} key={index}>
                                    { this.getDateStatistics(new Date(day.date)) }
                                    <span>${day.money}</span>
                                </div>
                                ))
                            : <h1>Статистика отсутствует</h1>
                        }
                    </div>
                </Container>
                <div className={styles.menuButtons}>
                    <div onClick={closeApp}>
                        <img src={info} />
                        <span>Информация</span>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    info: state.info,
    business: state.info.biz[0]
});

const mapDispatchToProps = dispatch => ({
    closeApp: () => dispatch(closeApp())
});

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
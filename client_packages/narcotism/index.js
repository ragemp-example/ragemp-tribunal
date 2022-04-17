let narcotismInterval;

const NARCOTISM_INTERVAL_TIME = 1000 * 60 * 60 * 2;
// раз в 5 часов при минимальной зависимости
// раз в 3 минуты при зависимости 100

const getNarcotismPower = value => {
  if (value < 50) return 1;
  if (value < 75) return 2;
  if (value < 100) return 3;
  if (value >= 100) return 4;
};

const EFFECT_NAME = 'DrugsDrivingIn';

let peds = [{
    model: "s_m_m_doctor_01",
    position: {
        x: 355.9098205566406,
        y: -573.7312622070312,
        z: 28.898839950561523,
    },
    heading: 38.6266,
    defaultScenario: 'Standing'
}];

mp.events.add({
    "characterInit.done": () => {
        peds.forEach((ped) => {
            mp.events.call('NPC.create', ped);
        })
    },
    "narcotism.update": (narcotism) => {
        if (narcotismInterval) {
            clearInterval(narcotismInterval);
            narcotismInterval = null;
        }

        if (narcotism < 30) return;

        narcotismInterval = setInterval(() => {
            mp.events.callRemote('narcotism.withdrawal');
        },  NARCOTISM_INTERVAL_TIME / getNarcotismPower(narcotism));
    },
    "narcotism.stop": () => {
        clearInterval(narcotismInterval);
        narcotismInterval = null;
    },
    "narcotism.menu": (data) => {
        const items = data.map(current => ({
            text: current.name,
            values: [`$${current.price}`],
        }));

        items.push({ text: 'Закрыть' });

        mp.callCEFV(`selectMenu.setItems('narcotismDoctor', ${JSON.stringify(items)});`);
        mp.events.call('selectMenu.show', 'narcotismDoctor');
    },
    "narcotism.menu.close": () => {
        mp.callCEFV(`selectMenu.show = false`);
    },
    "narcotism.treated": () => {
        mp.callCEFV(`selectMenu.loader = true`);
        mp.events.callRemote('narcotism.treated');
    },
    "narcotism.treated.ans": (ans) => {
        mp.callCEFV(`selectMenu.loader = false`);

        switch (ans) {
            case 0:
                mp.callCEFV(`selectMenu.notification = 'Ошибка операции'`);
                break;
            case 1:
                mp.events.call('narcotism.menu.close');
                break;
            case 2:
                mp.callCEFV(`selectMenu.notification = 'Недостаточно денег'`);
                break;
            case 3:
                mp.callCEFV(`selectMenu.notification = 'Лечиться можно раз в час'`);
                break;
            case 4:
                mp.callCEFV(`selectMenu.notification = 'У вас нет наркозависимости'`);
                break;
        }
    }
});
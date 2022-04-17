import styled from 'styled-components';


export const Container = styled.div`
  width: ${props => props.width ? '92%' : '86%'};
  margin-left: ${props => props.width ? '4%' : '7%'};
  margin-top: 5%;
`;

export const Button = styled.div`
  background: linear-gradient(90deg, #56AB2F 0%, #A8E063 100%);
  box-shadow: 0px 15px 25px rgba(0, 0, 0, 0.15);
  color: white;
  padding: 1.3em 0.5em;
  box-sizing: border-box;
  border-radius: 0.8em;
  text-align: center;
  margin-top: 4%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in-out;
  position: absolute;
  bottom: 7%;
  width: 86%;
  font-weight: 500;
  font-size: 1.1em;
  
  &:hover {
    //background: #56AB2F;
  }
`;

export const Input = styled.input`
  font-size: 1em;
  color: black;
  background-color: #EBEBEB;
  padding: 0.6em 0.9em;
  box-sizing: border-box;
  width: 100%;
  border-radius: 0.4em;
  margin-top: 0.5em;
  outline: none;
  border: ${props => props.error ? '0.1em solid #E07263' : '0.1em solid #EBEBEB'};
  
  &::placeholder {
    color: #BFBFBF;
  }
`;

export function formatPrice(_number) {
    let decimal=0;
    let separator=' ';
    let decpoint = '.';
    let format_string = '#';

    let r=parseFloat(_number)

    let exp10=Math.pow(10,decimal);// приводим к правильному множителю
    r=Math.round(r*exp10)/exp10;// округляем до необходимого числа знаков после запятой

    let rr=Number(r).toFixed(decimal).toString().split('.');

    let b=rr[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1"+separator);

    r=(rr[1]?b+ decpoint +rr[1]:b);
    return format_string.replace('#', r);
}
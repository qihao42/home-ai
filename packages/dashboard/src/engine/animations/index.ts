import type { Animation } from '../types';
import { smile } from './smile';
import { fire } from './fire';
import { rainbow } from './rainbow';
import { wave } from './wave';
import { welcome } from './welcome';
import { clock } from './clock';
import { alert } from './alert';
import { night } from './night';
import { weather } from './weather';

export const animations: Animation[] = [
  smile,
  fire,
  rainbow,
  wave,
  welcome,
  clock,
  weather,
  alert,
  night,
];

export { smile, fire, rainbow, wave, welcome, clock, alert, night, weather };
export { refreshWeather, updateWeather, getWeather } from './weather';

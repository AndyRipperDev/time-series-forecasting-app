import { useResetRecoilState, useSetRecoilState } from 'recoil'
import { roleAtom, rolesAtom } from '../state'
import { useAxiosWrapper } from './axios-wrapper'

export { useDateUtils }

function useDateUtils() {
  return {
    getDateDiff,
  }

  function getUnitText(unitValue, unitTextArr) {
    return (unitValue === 1) ? unitValue + ' ' + unitTextArr[0] + ' ' : (unitValue > 1) ? unitValue + ' ' + unitTextArr[1] + ' ' : ''
  }

  function getDateDiff(date1, date2) {
    const dt_date1 = new Date(date1)
    const dt_date2 = new Date(date2)

    const date1_time_stamp = dt_date1.getTime()
    const date2_time_stamp = dt_date2.getTime()

    let calc

    if (date1_time_stamp > date2_time_stamp) {
      calc = new Date(date1_time_stamp - date2_time_stamp)
    } else {
      calc = new Date(date2_time_stamp - date1_time_stamp)
    }

    const calcFormatTmp = calc.getDate() + '-' + (calc.getMonth() + 1) + '-' + calc.getFullYear() + '-' + calc.getHours() + '-' + calc.getMinutes() + '-' + calc.getSeconds()

    const calcFormat = calcFormatTmp.split("-")

    const days_passed = Number(Math.abs(calcFormat[0]) - 1)
    const months_passed = Number(Math.abs(calcFormat[1]) - 1)
    const years_passed = Number(Math.abs(calcFormat[2]) - 1970)
    const hours_passed = Number(Math.abs(calcFormat[3]) - 1)
    const minutes_passed = Number(Math.abs(calcFormat[4]))
    const seconds_passed = Number(Math.abs(calcFormat[5]))

    const yrsTxt = ["year", "years"]
    const mnthsTxt = ["month", "months"]
    const daysTxt = ["day", "days"]
    const hoursTxt = ["hour", "hours"]
    const minutesTxt = ["minute", "minutes"]
    const secondsTxt = ["second", "seconds"]

    const result = getUnitText(years_passed, yrsTxt) +
      getUnitText(months_passed, mnthsTxt) +
      getUnitText(days_passed, daysTxt) +
      getUnitText(hours_passed, hoursTxt) +
      getUnitText(minutes_passed, minutesTxt) +
      getUnitText(seconds_passed, secondsTxt)

    return result.trim()
  }
}
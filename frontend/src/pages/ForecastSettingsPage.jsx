import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import {
  projectDatasetColumnsAtom,
  themeAtom,
  projectDatasetColumnsViewAtom, forecastingModelsAtom,
} from '../state'
import { useEffect, useState } from 'react'
import { useProjectService } from '../services/project.service'
import LoadingPage from '../components/Loadings/LoadingPage'
import Plot from 'react-plotly.js'
import daisyuiColors from 'daisyui/src/colors/themes'
import { useForecastService } from '../services/forecast.service'

const ForecastSettingsPage = () => {
  const { id } = useParams()
  const [loadingColView, setLoadingColView] = useState(false)
  const projectService = useProjectService()
  const forecastService = useForecastService()
  const theme = useRecoilValue(themeAtom)
  const projectDatasetColumns = useRecoilValue(projectDatasetColumnsAtom)
  const forecastingModels = useRecoilValue(forecastingModelsAtom)
  const projectDatasetColumnsView = useRecoilValue(
    projectDatasetColumnsViewAtom
  )
  const [splitValueRange, setSplitValueRange] = useState(80)
  const [splitDataValue, setSplitDataValue] = useState(0)

  useEffect(() => {
    projectService.getDatasetColumns(id)
    forecastService.getAllModels()

    return () => {
      projectService.resetDatasetColumns()
      projectService.resetDatasetColumnsView()
      forecastService.resetForecastingModels()
    }
  }, [])

  useEffect(() => {
    if(projectDatasetColumnsView) {
      setSplitValueRange(80)
      splitData(80)
    }

  }, [projectDatasetColumnsView])

  function setColumnsView(column) {
    setLoadingColView(true)
    projectService.resetDatasetColumnsView()
    projectService.getDatasetColumnValues(id, 0, 0, column, true).then(() => {
      window.dispatchEvent(new Event('resize'))
      setLoadingColView(false)
    })
  }

  function handleSelectedColumnChange(e) {
    setColumnsView(e.target.value)
  }


  function handleSelectedForecastingModelChange(e) {
    console.log(e.target.value)
  }

  function splitData(percentValue) {
    let splitValue = Math.round(projectDatasetColumnsView.values_count * percentValue / 100)
    setSplitDataValue(splitValue)
  }

  function handleSplitRangeChange(e) {
    let percentValue = e.target.value
    setSplitValueRange(percentValue)
    splitData(percentValue)
    // window.dispatchEvent(new Event('resize'))
  }

  const loading = !projectDatasetColumns
  // const loadingColView = !projectDatasetColumnsView
  return (
    <div className={'my-12'}>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className={'w-full'}>
          {projectDatasetColumns && (
            <div className={'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-6xl space-y-4 mb-6'}>
              <h1 className={'text-3xl font-bold text-center mb-20'}>
                Forecast Settings
              </h1>

              <h2 className={'text-2xl font-bold self-start mb-4 mt-20'}>
                Choose Data
              </h2>
              <div className="flex space-x-4 justify-between items-center w-full bg-base-200 p-6 rounded-2xl shadow-xl mb-10">
                <p className="text-lg font-semibold">Select Column</p>
                <div>
                  <select
                    className="select select-bordered w-full"
                    onChange={(e) => handleSelectedColumnChange(e)}
                  >
                    <option
                      value=""
                      disabled={projectDatasetColumnsView !== null}
                    >
                      --Please choose a column--
                    </option>
                    {projectDatasetColumns.map(
                      (column) =>
                        !column.is_date && (
                          <option key={column.id} value={column.name}>
                            {column.name}
                          </option>
                        )
                    )}
                  </select>
                </div>
              </div>

              {loadingColView ? (
                <LoadingPage />
              ) : (
                <div className={'w-full'}>
                  {projectDatasetColumnsView && (
                    <div>
                      <h2 className={'text-2xl font-bold self-start mb-4 mt-20'}>
                        Split Data
                      </h2>
                      <div className=" bg-base-200 rounded-2xl shadow-xl my-4 p-5">
                        <Plot
                          className={'w-full h-full'}
                          data={[
                            {
                              y: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[0].values.slice(0, splitDataValue + 1),
                              x: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[1].values.slice(0, splitDataValue + 1),
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Training Data',
                              marker: {
                                color:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'primary'
                                    ],
                              },
                            },
                            {
                              y: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[0].values.slice(splitDataValue),
                              x: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[1].values.slice(splitDataValue),
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Test Data',
                              marker: {
                                color:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'secondary'
                                    ],
                              },
                            },
                          ]}
                          layout={{
                            // width: '100%',
                            title: Object.keys(
                              projectDatasetColumnsView?.dataset
                            )[0],
                            font: {
                              color:
                                daisyuiColors[`[data-theme=${theme}]`][
                                  'base-content'
                                  ],
                            },
                            paper_bgcolor:
                              daisyuiColors[`[data-theme=${theme}]`]['base-200'],
                            plot_bgcolor:
                              daisyuiColors[`[data-theme=${theme}]`]['base-200'],
                            autosize: true,
                          }}
                          useResizeHandler={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>

                      <div className={'w-full bg-base-200 py-4 px-6 rounded-2xl shadow-xl mt-6'}>
                        <label htmlFor="" className={'font-bold text-lg'}>
                          Split Ratio
                        </label>
                        <div className="badge ml-4">{splitValueRange} : {100 - splitValueRange}</div>
                        <div className={'flex space-x-4 mb-6 mt-2 items-center'}>
                          <div className="badge">0</div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={splitValueRange}
                            onChange={handleSplitRangeChange}
                            className="range range-primary"
                          />
                          <div className="badge">
                            100
                          </div>
                        </div>
                      </div>

                      <h2 className={'text-2xl font-bold self-start mb-4 mt-24'}>
                        Set Model
                      </h2>
                      <div className={'w-full'}>
                        {forecastingModels && (
                          <div className="flex space-x-4 justify-between items-center w-full bg-base-200 p-6 rounded-2xl shadow-xl mb-10">
                            <p className="text-lg font-semibold">Select Forecasting Model</p>
                            <div>
                              <select
                                className="select select-bordered w-full"
                                onChange={(e) => handleSelectedForecastingModelChange(e)}
                              >
                                {forecastingModels.models.map(
                                  (model) =>
                                    <option key={model} value={model}>
                                      {model}
                                    </option>
                                )}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={'w-full flex justify-center mt-24'}>
                        <button className="btn btn-primary btn-wide gap-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          Forecast
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForecastSettingsPage

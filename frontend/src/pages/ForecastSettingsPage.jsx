import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import {
  projectDatasetColumnsAtom,
  themeAtom,
  projectDatasetColumnsViewAtom,
} from '../state'
import { useEffect, useState } from 'react'
import { useProjectService } from '../services/project.service'
import LoadingPage from '../components/Loadings/LoadingPage'
import Plot from 'react-plotly.js'
import daisyuiColors from 'daisyui/src/colors/themes'

const ForecastSettingsPage = () => {
  const { id } = useParams()
  const [loadingColView, setLoadingColView] = useState(false)
  const projectService = useProjectService()
  const theme = useRecoilValue(themeAtom)
  const projectDatasetColumns = useRecoilValue(projectDatasetColumnsAtom)
  const projectDatasetColumnsView = useRecoilValue(
    projectDatasetColumnsViewAtom
  )
  const [splitValueRange, setSplitValueRange] = useState(80)
  const [splitDataValue, setSplitDataValue] = useState(0)

  useEffect(() => {
    projectService.getDatasetColumns(id)

    return () => {
      projectService.resetDatasetColumns()
      projectService.resetDatasetColumnsView()
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
        <div className={'flex flex-col items-center'}>
          {projectDatasetColumns && (
            <div className={'flex flex-col items-center space-y-4 w-full mb-6'}>
              <div
                className={
                  'flex flex-col items-center space-y-4 w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 '
                }
              >
                <h1 className={'text-3xl font-bold text-center mb-10'}>
                  Forecast Settings
                </h1>
                <div className="grid grid-cols-3 gap-4 w-full bg-base-200 p-6 rounded-2xl shadow-xl mb-10">
                  <div className="place-self-center">
                    <p className="text-lg font-semibold">Select Column</p>
                  </div>
                  <div className="col-span-2"><select
                    className="select select-bordered w-full max-w-xs"
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

              </div>
              {loadingColView ? (
                <LoadingPage />
              ) : (
                <div className={'w-3/4 mx-auto'}>
                  {projectDatasetColumnsView && (
                    <div>
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
                      <div
                        className={
                          'flex flex-col space-y-4 w-full bg-base-200 p-6 rounded-2xl shadow-xl mb-6'
                        }
                      >

                        <div className="flex flex-col w-full border-opacity-50">
                          <div>
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
                        </div>
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

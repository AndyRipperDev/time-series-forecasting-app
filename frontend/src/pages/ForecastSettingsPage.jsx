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

  useEffect(() => {
    projectService.getDatasetColumns(id)

    return () => {
      projectService.resetDatasetColumns()
      projectService.resetDatasetColumnsView()
    }
  }, [])

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
                  'flex flex-col items-center space-y-4 w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 bg-base-200 p-6 rounded-2xl shadow-xl mb-6'
                }
              >
                <h1 className={'text-xl font-bold text-center'}>
                  Forecast Settings
                </h1>
                <select
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
              {loadingColView ? (
                <LoadingPage />
              ) : (
                <div className={'w-3/4 mx-auto'}>
                  {projectDatasetColumnsView && (
                    <div className=" bg-base-200 rounded-2xl my-4 p-5">
                      <Plot
                        className={'w-full h-full'}
                        data={[
                          {
                            y: Object.values(
                              projectDatasetColumnsView?.dataset
                            )[0].values,
                            x: Object.values(
                              projectDatasetColumnsView?.dataset
                            )[1].values,
                            type: 'scatter',
                            mode: 'lines',
                            marker: {
                              color:
                                daisyuiColors[`[data-theme=${theme}]`][
                                  'secondary'
                                ],
                            },
                          },
                        ]}
                        layout={{
                          width: '100%',
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

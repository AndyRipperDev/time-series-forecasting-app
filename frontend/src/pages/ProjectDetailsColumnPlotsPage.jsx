import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRecoilValue } from 'recoil'

import daisyuiColors from 'daisyui/src/colors/themes'

import { projectAtom, projectDatasetColumnsViewAtom, themeAtom } from '../state'
import { useProjectService } from '../services/project.service'

import Plot from 'react-plotly.js'
import LoadingPage from '../components/Loadings/LoadingPage'

export { ProjectDetailsColumnPlotsPage }

function ProjectDetailsColumnPlotsPage() {
  const { id } = useParams()
  const [dateColumn, setDateColumn] = useState(null)
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
  const theme = useRecoilValue(themeAtom)
  const projectDatasetColumnsView = useRecoilValue(
    projectDatasetColumnsViewAtom
  )

  const [minValueRange, setMinValueRange] = useState(0)
  const [maxValueRange, setMaxValueRange] = useState(1000)

  useEffect(() => {
    projectService.getById(id).then((response) => {
      projectService.getDatasetColumnValues(id)
    })

    return projectService.resetDatasetColumnsView
  }, [])

  useEffect(() => {
    if (projectDatasetColumnsView) {
      Object.keys(projectDatasetColumnsView.dataset).map((colKey, colIndex) => {
        if (projectDatasetColumnsView.dataset[colKey].is_date) {
          setDateColumn(projectDatasetColumnsView.dataset[colKey].values)
        }
      })

      if (
        maxValueRange === 1000 &&
        projectDatasetColumnsView.values_count < 1000
      ) {
        setMaxValueRange(projectDatasetColumnsView.values_count)
      }
    }
  }, [projectDatasetColumnsView])

  // useEffect(() => {
  //   if (showAllTriggered) {
  //     getColumnData()
  //   }
  // }, [minValueRange, maxValueRange])

  function getColumnData(skip = minValueRange, limit = maxValueRange) {
    projectService.getDatasetColumnValues(id, skip, limit).then(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }

  function handleMinRangeChange(e) {
    let val = e.target.value
    if (val < maxValueRange) {
      setMinValueRange(val)
    }
  }

  function handleMaxRangeChange(e) {
    let val = e.target.value
    if (val > minValueRange) {
      setMaxValueRange(val)
    }
  }

  function handleShowAll(e) {
    getColumnData(0, projectDatasetColumnsView.values_count)
    setMinValueRange(0)
    setMaxValueRange(projectDatasetColumnsView.values_count)
  }

  function handleRangeEnd(e) {
    getColumnData()
  }

  const loading = !projectDatasetColumnsView

  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className={'my-12'}>
          {projectDatasetColumnsView && (
            <div className={'flex flex-col items-center'}>
              <h1 className="text-3xl font-bold md:text-4xl mb-16">
                {project.title}
              </h1>
              <h1 className="text-2xl font-bold mb-12">
                Dataset Columns Visualization
              </h1>

              {dateColumn && (
                <div
                  className={
                    'flex flex-col space-y-4 w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 bg-base-200 p-6 rounded-2xl shadow-xl mb-6'
                  }
                >
                  <h1 className={'text-xl font-bold text-center'}>
                    Data range
                  </h1>
                  <div className="flex flex-col w-full border-opacity-50">
                    <div>
                      <label htmlFor="" className={'font-bold text-lg'}>
                        Min value
                      </label>
                      <div className="badge ml-4">{minValueRange}</div>
                      <div className={'flex space-x-4 mb-6 mt-2 items-center'}>
                        <div className="badge">0</div>
                        <input
                          type="range"
                          min="0"
                          max={projectDatasetColumnsView.values_count}
                          value={minValueRange}
                          onChange={handleMinRangeChange}
                          onMouseUp={handleRangeEnd}
                          onTouchEnd={handleRangeEnd}
                          className="range range-primary"
                        />
                        <div className="badge">
                          {projectDatasetColumnsView.values_count}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="" className={'font-bold text-lg'}>
                        Max value
                      </label>
                      <div className="badge ml-4">{maxValueRange}</div>
                      <div className={'flex space-x-4 mb-2 mt-2 items-center'}>
                        <div className="badge">0</div>
                        <input
                          type="range"
                          min="0"
                          value={maxValueRange}
                          max={projectDatasetColumnsView.values_count}
                          onChange={handleMaxRangeChange}
                          onMouseUp={handleRangeEnd}
                          onTouchEnd={handleRangeEnd}
                          className="range range-primary"
                        />
                        <div className="badge">
                          {projectDatasetColumnsView.values_count}
                        </div>
                      </div>
                    </div>
                    <div className="divider">OR</div>
                    <button className="btn btn-primary" onClick={handleShowAll}>
                      Show All
                    </button>
                  </div>
                </div>
              )}

              {Object.keys(projectDatasetColumnsView.dataset).map(
                (colKey, colIndex) => {
                  return (
                    <div key={colIndex} className={'w-3/4 mx-auto'}>
                      {!projectDatasetColumnsView.dataset[colKey].is_date && (
                        <div className="collapse collapse-arrow border border-base-200 bg-base-200 rounded-box my-4">
                          <input type="checkbox" defaultChecked={true} />
                          <div className="collapse-title text-xl font-medium">
                            {colKey}
                          </div>
                          <div className="collapse-content">
                            <Plot
                              className={'w-full h-full'}
                              data={[
                                {
                                  y: projectDatasetColumnsView.dataset[colKey]
                                    .values,
                                  x: dateColumn,
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
                                // width: '100%',
                                //width: 600,
                                //height: 400,
                                title: colKey,
                                font: {
                                  color:
                                    daisyuiColors[`[data-theme=${theme}]`][
                                      'base-content'
                                    ],
                                },
                                paper_bgcolor:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'base-200'
                                  ],
                                plot_bgcolor:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'base-200'
                                  ],
                                autosize: true,
                              }}
                              useResizeHandler={true}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

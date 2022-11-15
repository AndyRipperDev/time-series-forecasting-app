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
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
  const theme = useRecoilValue(themeAtom)
  const projectDatasetColumnsView = useRecoilValue(
    projectDatasetColumnsViewAtom
  )

  useEffect(() => {
    projectService.getById(id).then((response) => {
      projectService.getDatasetColumnValues(id)
    })

    return projectService.resetDatasetColumnsView
  }, [])

  const loading = !projectDatasetColumnsView
  console.log(daisyuiColors[`[data-theme=${theme}]`].secondary)
  console.log(daisyuiColors[`[data-theme=${theme}]`]['base-100'])
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

              {Object.keys(projectDatasetColumnsView).map(
                (colKey, colIndex) => {
                  return (
                    <div
                      key={colIndex}
                      className="collapse collapse-arrow border border-base-200 bg-base-200 rounded-box my-2"
                    >
                      <input type="checkbox" defaultChecked={true} />
                      <div className="collapse-title text-xl font-medium">
                        {colKey}
                      </div>
                      <div className="collapse-content">
                        <Plot
                          className={'mx-auto'}
                          data={[
                            {
                              y: projectDatasetColumnsView[colKey],
                              type: 'scattergl',
                              mode: 'lines',
                              // marker: { color: 'red' },
                              marker: {
                                color:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'secondary'
                                  ],
                              },
                            },
                          ]}
                          layout={{
                            width: 600,
                            height: 400,
                            title: colKey,
                            // paper_bgcolor: 'rgba(0, 0, 0, 0)',
                            // plot_bgcolor: 'rgba(0, 0, 0, 0)',

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
                          }}
                        />
                      </div>
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

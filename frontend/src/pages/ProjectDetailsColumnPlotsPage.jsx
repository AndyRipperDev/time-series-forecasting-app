import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRecoilValue } from 'recoil'

import { projectAtom, projectDatasetColumnsViewAtom } from '../state'
import { useProjectService } from '../services/project.service'

import Plot from 'react-plotly.js'
import LoadingPage from '../components/Loadings/LoadingPage'

export { ProjectDetailsColumnPlotsPage }

function ProjectDetailsColumnPlotsPage() {
  const { id } = useParams()
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
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
  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className={'my-12'}>
          {projectDatasetColumnsView && (
            <div className={'flex flex-col items-center'}>
              <h1 className="text-3xl font-bold mb-20">
                Dataset Columns Visualization
              </h1>

              {Object.keys(projectDatasetColumnsView).map(
                (colKey, colIndex) => {
                  return (
                    <div key={colIndex} className="collapse collapse-arrow border border-base-200 bg-base-200 rounded-box my-2">
                      <input type="checkbox"
                             defaultChecked={true} />
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
                              marker: { color: 'red' },
                            },
                          ]}
                          layout={{ width: 600, height: 400, title: colKey }}
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

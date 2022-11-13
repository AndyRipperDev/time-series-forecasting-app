import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRecoilValue } from 'recoil'

import { projectAtom, projectDatasetColumnsViewAtom } from '../state'
import { useProjectService } from '../services/project.service'


import Plot from 'react-plotly.js';
import LoadingPage from '../components/Loadings/LoadingPage'

export { ProjectDetailsColumnPlotsPage }

function ProjectDetailsColumnPlotsPage() {
  const { id } = useParams()
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
  const projectDatasetColumnsView = useRecoilValue(projectDatasetColumnsViewAtom)


  useEffect(() => {
    projectService.getById(id).then(response => {
      projectService.getDatasetColumnValues(id)
    })

    return projectService.resetDatasetColumnsView
  }, [])


  const loading = !projectDatasetColumnsView
  console.log(projectDatasetColumnsView)
  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div>
          {projectDatasetColumnsView && (
            <div>
              {Object.keys(projectDatasetColumnsView).map((colKey, colIndex) => {
                return (
                  <Plot
                    key={colIndex}
                    data={[
                      {
                        y: projectDatasetColumnsView[colKey],
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: {color: 'red'},
                      },
                    ]}
                    layout={ {width: 600, height: 400, title: colKey } }
                  />
                );
              })}
            </div>
          )}
        </div>
        )}
    </div>
  )
}

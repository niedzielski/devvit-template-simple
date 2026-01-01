import {getWebViewMode, requestExpandedMode} from '@devvit/web/client'

const mode = getWebViewMode()
if (mode !== 'expanded')
  document.body.addEventListener('click', async ev => {
    await requestExpandedMode(ev, 'default')
  })

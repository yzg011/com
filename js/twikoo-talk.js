const wrap = document.getElementById('twikoo-talk-wrap')
const loadBtn = document.getElementById('loadMore')
const previewBox = document.getElementById('img-preview')
const previewImg = document.getElementById('preview-img')
let originData = []

// 图片预览
function bindImgPreview(){
  document.querySelectorAll('.talk-img img').forEach(img=>{
    img.onclick = function(){
      previewImg.src = this.src
      previewBox.classList.add('show')
    }
  })
}
previewBox.onclick = e=>{
  if(e.target === previewBox) previewBox.classList.remove('show')
}
document.addEventListener('keydown',e=>{
  if(e.key === 'Escape') previewBox.classList.remove('show')
})

// 数据请求
async function getTalkData(){
  const res = await fetch(`${envId}/api/getComments?url=/talking/&limit=${pageSize}&page=${page}`)
  const json = await res.json()
  let currList = json.data.comments.filter(item=>item.nick === masterName)
  if(currList.length === 0){
    loadBtn.innerText = "没有更多啦"
    loadBtn.disabled = true
    return []
  }
  originData = [...originData,...currList]
  page++
  return sortAndTop(originData)
}

// 置顶+排序处理
function sortAndTop(list){
  let topArr = []
  let normalArr = []
  // 关键词匹配置顶
  list.forEach(item=>{
    if(item.content.includes(topKeyword)){
      topArr.push(item)
    }else{
      normalArr.push(item)
    }
  })
  // 时间排序
  normalArr.sort((a,b)=>{
    let t1 = new Date(a.created).getTime()
    let t2 = new Date(b.created).getTime()
    return sortType === 'desc' ? t2-t1 : t1-t2
  })
  // 置顶全部放最前面
  return [...topArr,...normalArr]
}

// 年月分组
function groupByMonth(list){
  const groupObj = {}
  list.forEach(item=>{
    const d = new Date(item.created)
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    if(!groupObj[ym]) groupObj[ym] = []
    groupObj[ym].push(item)
  })
  return groupObj
}

// 渲染
async function render(isAppend=false){
  let list
  if(!isAppend){
    originData = []
    page = 1
    loadBtn.innerText = "加载更多"
    loadBtn.disabled = false
    list = await getTalkData()
  }else{
    list = await getTalkData()
  }
  const group = groupByMonth(list)
  let html = ''
  for(let ym in group){
    html += `<div class="month-title">${ym}</div>`
    group[ym].forEach(comment=>{
      let time = new Date(comment.created).toLocaleDateString()
      let content = comment.content
      let imgHtml = ''
      if(comment.imgUrls && comment.imgUrls.length){
        imgHtml = `<div class="talk-img">${comment.imgUrls.map(i=>`<img src="${i}" loading="lazy">`).join('')}</div>`
      }
      // 置顶标签
      let topTag = comment.content.includes(topKeyword) ? '<span class="top-tag">置顶</span>' : ''
      html += `
      <div class="talk-card ${topTag?'top-card':''}">
        <div class="talk-time">${topTag}${time}</div>
        <div class="talk-text">${content.replaceAll(topKeyword,'')}</div>
        ${imgHtml}
      </div>
      `
    })
  }
  wrap.innerHTML = html
  wrap.className = `talk-container ${renderType}-mode`
  bindImgPreview()
}

// 布局切换
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
    renderType = btn.dataset.type
    wrap.className = `talk-container ${renderType}-mode`
  }
})

// 排序切换
document.querySelectorAll('.sort-btn').forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
    sortType = btn.dataset.sort
    render()
  }
})

// 加载更多
loadBtn.onclick = ()=>{
  render(true)
}

// 初始渲染
render()
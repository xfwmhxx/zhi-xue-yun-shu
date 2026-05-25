<template>
  <div class="simulation-teaching-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <i class="fas fa-vr-cardboard"></i>
      <h1>仿真教学管理</h1>
      <div class="header-badge"><i class="fas fa-leaf"></i> 经络穴位 · 3D仿真</div>
      <button class="btn-create" @click="openAddAcupoint"><i class="fas fa-plus"></i> 新增穴位</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <i class="fas fa-dot-circle"></i>
        <div class="stat-num">361</div>
        <div class="stat-label">穴位总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-charging-station"></i>
        <div class="stat-num">12</div>
        <div class="stat-label">经络总数</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-cube"></i>
        <div class="stat-num">361</div>
        <div class="stat-label">已建模穴位</div>
      </div>
      <div class="stat-mini-card">
        <i class="fas fa-sync-alt"></i>
        <div class="stat-num">95%</div>
        <div class="stat-label">定位精度</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-area">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索穴位名称/经络/拼音..." v-model="searchKeyword" />
      </div>
      <div class="filter-area">
        <select v-model="filterMeridian">
          <option value="">全部经络</option>
          <option v-for="meridian in meridians" :key="meridian" :value="meridian">{{ meridian }}</option>
        </select>
        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-undo-alt"></i> 重置
        </button>
      </div>
      <div class="view-toggle">
        <button :class="['toggle-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">
          <i class="fas fa-list"></i> 列表
        </button>
        <button :class="['toggle-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">
          <i class="fas fa-th"></i> 网格
        </button>
      </div>
    </div>

    <!-- 穴位列表（表格形式） -->
    <div class="xinglin-card" v-if="viewMode === 'list'">
      <div class="table-wrapper">
        <table class="acupoint-table">
          <thead>
            <tr>
              <th>编号</th>
              <th>穴位名称</th>
              <th>拼音</th>
              <th>所属经络</th>
              <th>Unity坐标 (X, Y, Z)</th>
              <th>定位描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in paginatedAcupoints" :key="point.id">
              <td class="point-code">{{ point.code }}</td>
              <td class="point-name">{{ point.name }}</td>
              <td>{{ point.pinyin }}</td>
              <td>
                <span class="meridian-badge" :style="{ backgroundColor: getMeridianColor(point.meridian) }">
                  {{ point.meridian }}
                </span>
              </td>
              <td class="coord-cell">
                <code class="coord-code">
                  ({{ point.position.x.toFixed(2) }}, {{ point.position.y.toFixed(2) }}, {{ point.position.z.toFixed(2) }})
                </code>
                <button class="copy-coord-btn" @click="copyCoordinates(point)">
                  <i class="fas fa-copy"></i>
                </button>
              </td>
              <td class="location-desc">{{ point.location }}</td>
              <td class="action-cell">
                <button class="action-icon" @click="preview3D(point)" title="3D预览">
                  <i class="fas fa-cube"></i>
                </button>
                <button class="action-icon" @click="editAcupoint(point)" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-icon" @click="deleteAcupoint(point)" title="删除">
                  <i class="fas fa-trash-alt"></i>
                </button>
                <button class="action-icon" @click="showPointDetail(point)" title="详情">
                  <i class="fas fa-info-circle"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>共 {{ filteredAcupoints.length }} 个穴位</span>
        <div class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
        </div>
      </div>
    </div>

    <!-- 网格视图 -->
    <div class="grid-view" v-if="viewMode === 'grid'">
      <div class="acupoint-grid">
        <div v-for="point in paginatedAcupoints" :key="point.id" class="acupoint-card xinglin-card">
          <div class="acupoint-header">
            <span class="point-code-badge">{{ point.code }}</span>
            <span class="point-name-large">{{ point.name }}</span>
            <span class="point-pinyin">{{ point.pinyin }}</span>
          </div>
          <div class="acupoint-body">
            <div class="meridian-info">
              <i class="fas fa-charging-station"></i>
              <span>{{ point.meridian }}</span>
            </div>
            <div class="coord-info">
              <i class="fas fa-cube"></i>
              <code>X: {{ point.position.x.toFixed(2) }} | Y: {{ point.position.y.toFixed(2) }} | Z: {{ point.position.z.toFixed(2) }}</code>
              <button class="copy-small" @click="copyCoordinates(point)">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="location-info">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ point.location }}</span>
            </div>
          </div>
          <div class="acupoint-footer">
            <button class="btn-preview" @click="preview3D(point)">
              <i class="fas fa-cube"></i> 3D预览
            </button>
            <button class="btn-detail" @click="showPointDetail(point)">
              <i class="fas fa-info-circle"></i> 详情
            </button>
          </div>
        </div>
      </div>
      <div class="table-footer">
        <span>共 {{ filteredAcupoints.length }} 个穴位</span>
        <div class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimulationTeaching',
  data() {
    return {
      searchKeyword: '',
      filterMeridian: '',
      viewMode: 'list',
      currentPage: 1,
      pageSize: 15,
      // 穴位数据
      acupoints: [
        { id: 1, code: 'LI20', name: '迎香', pinyin: 'Yingxiang', meridian: '手阳明大肠经', position: { x: 0.15, y: 1.62, z: 0.08 }, location: '鼻翼外缘中点旁，鼻唇沟中', indications: '鼻塞、鼻炎、面瘫', technique: '直刺0.1-0.2寸' },
        { id: 2, code: 'LU1', name: '中府', pinyin: 'Zhongfu', meridian: '手太阴肺经', position: { x: 0.18, y: 1.45, z: 0.12 }, location: '胸前壁外上方，第1肋间隙', indications: '咳嗽、气喘、胸痛', technique: '向外斜刺0.5-0.8寸' },
        { id: 3, code: 'ST36', name: '足三里', pinyin: 'Zusanli', meridian: '足阳明胃经', position: { x: 0.22, y: 0.85, z: 0.05 }, location: '犊鼻下3寸，胫骨前嵴外一横指', indications: '胃痛、呕吐、腹胀、强壮穴', technique: '直刺1-2寸' },
        { id: 4, code: 'SP6', name: '三阴交', pinyin: 'Sanyinjiao', meridian: '足太阴脾经', position: { x: 0.2, y: 0.78, z: 0.06 }, location: '内踝尖上3寸，胫骨内侧缘后方', indications: '月经不调、失眠、腹胀', technique: '直刺1-1.5寸' },
        { id: 5, code: 'HT7', name: '神门', pinyin: 'Shenmen', meridian: '手少阴心经', position: { x: -0.12, y: 1.32, z: 0.1 }, location: '腕横纹尺侧端，尺侧腕屈肌腱桡侧缘', indications: '心悸、失眠、健忘', technique: '直刺0.3-0.5寸' },
        { id: 6, code: 'SI3', name: '后溪', pinyin: 'Houxi', meridian: '手太阳小肠经', position: { x: -0.08, y: 1.28, z: 0.15 }, location: '第5掌指关节尺侧近端赤白肉际', indications: '头项强痛、腰背痛', technique: '直刺0.5-1寸' },
        { id: 7, code: 'BL40', name: '委中', pinyin: 'Weizhong', meridian: '足太阳膀胱经', position: { x: 0.05, y: 0.92, z: -0.18 }, location: '腘横纹中点，股二头肌腱与半腱肌腱中间', indications: '腰痛、膝痛、小便不利', technique: '直刺1-1.5寸' },
        { id: 8, code: 'KI3', name: '太溪', pinyin: 'Taixi', meridian: '足少阴肾经', position: { x: 0.18, y: 0.72, z: 0.08 }, location: '内踝尖与跟腱之间的凹陷中', indications: '肾虚、腰痛、耳鸣', technique: '直刺0.5-1寸' },
        { id: 9, code: 'PC6', name: '内关', pinyin: 'Neiguan', meridian: '手厥阴心包经', position: { x: -0.1, y: 1.35, z: 0.12 }, location: '腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间', indications: '心悸、胸痛、呕吐', technique: '直刺0.5-1寸' },
        { id: 10, code: 'SJ5', name: '外关', pinyin: 'Waiguan', meridian: '手少阳三焦经', position: { x: -0.12, y: 1.34, z: 0.14 }, location: '腕背横纹上2寸，尺骨与桡骨之间', indications: '头痛、发热、耳鸣', technique: '直刺0.5-1寸' },
        { id: 11, code: 'GB20', name: '风池', pinyin: 'Fengchi', meridian: '足少阳胆经', position: { x: 0.08, y: 1.58, z: -0.22 }, location: '胸锁乳突肌与斜方肌上端之间的凹陷中', indications: '头痛、眩晕、感冒', technique: '向鼻尖方向斜刺0.8-1.2寸' },
        { id: 12, code: 'LR3', name: '太冲', pinyin: 'Taichong', meridian: '足厥阴肝经', position: { x: 0.22, y: 0.75, z: 0.04 }, location: '第1、2跖骨间，跖骨底结合部前方凹陷中', indications: '头痛、高血压、月经不调', technique: '直刺0.5-0.8寸' },
        { id: 13, code: 'CV12', name: '中脘', pinyin: 'Zhongwan', meridian: '任脉', position: { x: 0.0, y: 1.18, z: 0.22 }, location: '脐中上4寸，前正中线上', indications: '胃痛、腹胀、呕吐', technique: '直刺1-1.5寸' },
        { id: 14, code: 'GV20', name: '百会', pinyin: 'Baihui', meridian: '督脉', position: { x: 0.0, y: 1.72, z: 0.0 }, location: '头部前发际正中直上5寸', indications: '头痛、眩晕、失眠', technique: '平刺0.5-0.8寸' },
        { id: 15, code: 'LU5', name: '尺泽', pinyin: 'Chize', meridian: '手太阴肺经', position: { x: -0.14, y: 1.42, z: 0.1 }, location: '肘横纹上，肱二头肌腱桡侧缘凹陷中', indications: '咳嗽、气喘、咽痛', technique: '直刺0.8-1.2寸' },
        { id: 16, code: 'LI4', name: '合谷', pinyin: 'Hegu', meridian: '手阳明大肠经', position: { x: -0.18, y: 1.38, z: 0.12 }, location: '第2掌骨桡侧中点处', indications: '头痛、发热、牙痛', technique: '直刺0.5-1寸' },
        { id: 17, code: 'ST40', name: '丰隆', pinyin: 'Fenglong', meridian: '足阳明胃经', position: { x: 0.25, y: 0.82, z: 0.06 }, location: '外踝尖上8寸，条口外一横指', indications: '痰多、咳嗽、眩晕', technique: '直刺1-1.5寸' },
        { id: 18, code: 'BL23', name: '肾俞', pinyin: 'Shenshu', meridian: '足太阳膀胱经', position: { x: 0.12, y: 1.05, z: -0.2 }, location: '第2腰椎棘突下，旁开1.5寸', indications: '肾虚、腰痛、耳鸣', technique: '直刺0.8-1.2寸' },
        { id: 19, code: 'CV6', name: '气海', pinyin: 'Qihai', meridian: '任脉', position: { x: 0.0, y: 0.98, z: 0.2 }, location: '脐中下1.5寸，前正中线上', indications: '气虚、腹痛、遗尿', technique: '直刺1-1.5寸' },
        { id: 20, code: 'GV14', name: '大椎', pinyin: 'Dazhui', meridian: '督脉', position: { x: 0.0, y: 1.48, z: -0.15 }, location: '第7颈椎棘突下凹陷中', indications: '发热、感冒、颈项痛', technique: '向上斜刺0.5-1寸' }
      ],
      meridians: ['手太阴肺经', '手阳明大肠经', '足阳明胃经', '足太阴脾经', '手少阴心经', '手太阳小肠经', '足太阳膀胱经', '足少阴肾经', '手厥阴心包经', '手少阳三焦经', '足少阳胆经', '足厥阴肝经', '任脉', '督脉']
    }
  },
  computed: {
    filteredAcupoints() {
      let result = this.acupoints
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(p => p.name.toLowerCase().includes(keyword) || p.pinyin.toLowerCase().includes(keyword) || p.code.toLowerCase().includes(keyword) || p.meridian.includes(keyword))
      }
      if (this.filterMeridian) {
        result = result.filter(p => p.meridian === this.filterMeridian)
      }
      return result
    },
    totalPages() {
      return Math.ceil(this.filteredAcupoints.length / this.pageSize)
    },
    paginatedAcupoints() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredAcupoints.slice(start, end)
    },
    modeledCount() {
      return this.acupoints.length
    }
  },
  watch: {
    searchKeyword() { this.currentPage = 1 },
    filterMeridian() { this.currentPage = 1 }
  },
  mounted() {
    this.injectModalStyles()
  },
  methods: {
    resetFilters() {
      this.searchKeyword = ''
      this.filterMeridian = ''
      this.currentPage = 1
    },
    getMeridianColor(meridian) {
      const colors = {
        '手太阴肺经': '#6ba5a5', '手阳明大肠经': '#c4a56e', '足阳明胃经': '#d4a373',
        '足太阴脾经': '#8fb38f', '手少阴心经': '#e08f6e', '手太阳小肠经': '#b8866b',
        '足太阳膀胱经': '#6a9c78', '足少阴肾经': '#7a6b8a', '手厥阴心包经': '#c97e5a',
        '手少阳三焦经': '#b89a6a', '足少阳胆经': '#8dab7f', '足厥阴肝经': '#a67c52',
        '任脉': '#c4713a', '督脉': '#5d8a6c'
      }
      return colors[meridian] || '#b87a48'
    },
    copyCoordinates(point) {
      const coordStr = `(${point.position.x.toFixed(2)}, ${point.position.y.toFixed(2)}, ${point.position.z.toFixed(2)})`
      navigator.clipboard.writeText(coordStr).then(() => alert(`坐标 ${coordStr} 已复制`)).catch(() => alert('复制失败'))
    },
    preview3D(point) {
      this.show3DPreview(point)
    },
    // 打开新增穴位弹窗
    openAddAcupoint() {
      this.showAcupointFormModal(null)
    },
    // 编辑穴位
    editAcupoint(point) {
      this.showAcupointFormModal(point)
    },
    // 删除穴位
    deleteAcupoint(point) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-trash-alt"></i> 确认删除</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body">
          <p style="font-size: 1rem; color: #4a2a12;">确定要删除穴位“${this.escapeHtml(point.name)} (${point.code})”吗？</p>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">确认删除</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      modal.querySelector('.btn-submit').onclick = () => {
        const index = this.acupoints.findIndex(p => p.id === point.id)
        if (index !== -1) {
          this.acupoints.splice(index, 1)
          alert('穴位已删除')
        }
        closeModal()
      }
    },
    // 显示穴位详情
    showPointDetail(point) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container detail-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-dot-circle"></i> ${this.escapeHtml(point.name)} · 穴位详情</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body detail-modal-body">
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">穴位编号：</span><span class="detail-value">${this.escapeHtml(point.code)}</span></div>
            <div class="detail-item"><span class="detail-label">拼音：</span><span class="detail-value">${this.escapeHtml(point.pinyin)}</span></div>
            <div class="detail-item"><span class="detail-label">所属经络：</span><span class="detail-value">${this.escapeHtml(point.meridian)}</span></div>
            <div class="detail-item"><span class="detail-label">Unity坐标：</span><code class="detail-coord">(${point.position.x}, ${point.position.y}, ${point.position.z})</code></div>
            <div class="detail-item full-width"><span class="detail-label">定位描述：</span><span class="detail-value">${this.escapeHtml(point.location)}</span></div>
            <div class="detail-item full-width"><span class="detail-label">主治功能：</span><span class="detail-value">${this.escapeHtml(point.indications || '头痛、感冒、颈项强痛')}</span></div>
            <div class="detail-item full-width"><span class="detail-label">操作手法：</span><span class="detail-value">${this.escapeHtml(point.technique || '直刺0.5-1寸，可灸')}</span></div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-submit" onclick="this.closest('.native-modal-overlay').remove()">关闭</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 显示3D预览
    show3DPreview(point) {
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container modal-3d'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-cube"></i> ${this.escapeHtml(point.name)} · 3D位置预览</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body-3d">
          <div class="unity-preview">
            <div class="preview-placeholder">
              <i class="fas fa-cube"></i>
              <div class="coord-visual">
                <div class="axis-line x-axis"></div>
                <div class="axis-line y-axis"></div>
                <div class="axis-line z-axis"></div>
                <div class="point-marker" style="transform: translate(${point.position.x * 50}px, ${-point.position.y * 30}px)"><i class="fas fa-dot-circle"></i></div>
              </div>
              <div class="preview-coord">坐标: (${point.position.x.toFixed(2)}, ${point.position.y.toFixed(2)}, ${point.position.z.toFixed(2)})</div>
              <p class="preview-note">* Unity 3D场景中的实际位置（示意图）</p>
            </div>
          </div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-submit" onclick="this.closest('.native-modal-overlay').remove()">关闭</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
    },
    // 显示穴位表单弹窗
    showAcupointFormModal(point) {
      const isEdit = !!point
      const title = isEdit ? '编辑穴位' : '新增穴位'
      const formData = isEdit ? {
        code: point.code, name: point.name, pinyin: point.pinyin, meridian: point.meridian,
        x: point.position.x, y: point.position.y, z: point.position.z,
        location: point.location, indications: point.indications || '', technique: point.technique || ''
      } : {
        code: '', name: '', pinyin: '', meridian: '手太阴肺经',
        x: 0, y: 0, z: 0, location: '', indications: '', technique: ''
      }
      const meridiansOptions = this.meridians.map(m => `<option value="${m}" ${formData.meridian === m ? 'selected' : ''}>${m}</option>`).join('')
      const overlay = document.createElement('div')
      overlay.className = 'native-modal-overlay'
      const modal = document.createElement('div')
      modal.className = 'native-modal-container form-modal'
      modal.innerHTML = `
        <div class="native-modal-header">
          <h3><i class="fas fa-edit"></i> ${title}</h3>
          <button class="native-modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="native-modal-body form-modal-body">
          <div class="form-row-3">
            <div class="form-group"><label>穴位编号 <span class="required">*</span></label><input type="text" id="code" value="${this.escapeHtml(formData.code)}" placeholder="如: LI20" /></div>
            <div class="form-group"><label>穴位名称</label><input type="text" id="name" value="${this.escapeHtml(formData.name)}" placeholder="如: 迎香" /></div>
            <div class="form-group"><label>拼音</label><input type="text" id="pinyin" value="${this.escapeHtml(formData.pinyin)}" placeholder="如: Yingxiang" /></div>
          </div>
          <div class="form-group"><label>所属经络</label><select id="meridian">${meridiansOptions}</select></div>
          <div class="form-row-3">
            <div class="form-group"><label>X坐标</label><input type="number" id="posX" value="${formData.x}" step="0.01" /></div>
            <div class="form-group"><label>Y坐标</label><input type="number" id="posY" value="${formData.y}" step="0.01" /></div>
            <div class="form-group"><label>Z坐标</label><input type="number" id="posZ" value="${formData.z}" step="0.01" /></div>
          </div>
          <div class="form-group"><label>定位描述</label><textarea id="location" rows="2" placeholder="请输入定位描述...">${this.escapeHtml(formData.location)}</textarea></div>
          <div class="form-group"><label>主治功能</label><textarea id="indications" rows="2" placeholder="请输入主治功能...">${this.escapeHtml(formData.indications)}</textarea></div>
          <div class="form-group"><label>操作手法</label><textarea id="technique" rows="2" placeholder="请输入操作手法...">${this.escapeHtml(formData.technique)}</textarea></div>
        </div>
        <div class="native-modal-footer">
          <button class="btn-cancel">取消</button>
          <button class="btn-submit">保存</button>
        </div>
      `
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
      const closeModal = () => overlay.remove()
      modal.querySelector('.native-modal-close').onclick = closeModal
      modal.querySelector('.btn-cancel').onclick = closeModal
      overlay.onclick = (e) => { if (e.target === overlay) closeModal() }
      modal.querySelector('.btn-submit').onclick = () => {
        const newCode = modal.querySelector('#code').value.trim()
        if (!newCode) { alert('请填写穴位编号'); return }
        const newName = modal.querySelector('#name').value.trim()
        if (!newName) { alert('请填写穴位名称'); return }
        const pointData = {
          id: isEdit ? point.id : Date.now(),
          code: newCode,
          name: newName,
          pinyin: modal.querySelector('#pinyin').value,
          meridian: modal.querySelector('#meridian').value,
          position: {
            x: parseFloat(modal.querySelector('#posX').value) || 0,
            y: parseFloat(modal.querySelector('#posY').value) || 0,
            z: parseFloat(modal.querySelector('#posZ').value) || 0
          },
          location: modal.querySelector('#location').value,
          indications: modal.querySelector('#indications').value,
          technique: modal.querySelector('#technique').value
        }
        if (isEdit) {
          const index = this.acupoints.findIndex(p => p.id === point.id)
          if (index !== -1) { this.acupoints[index] = { ...this.acupoints[index], ...pointData }; alert('穴位已更新') }
        } else {
          this.acupoints.push(pointData)
          alert('穴位已添加')
        }
        closeModal()
      }
    },
    escapeHtml(str) {
      if (!str) return ''
      return str.replace(/[&<>]/g, m => { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m })
    },
    injectModalStyles() {
      if (document.getElementById('modal-styles')) return
      const style = document.createElement('style')
      style.id = 'modal-styles'
      style.textContent = `
        .native-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(60, 40, 20, 0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 20000;
        }
        .native-modal-container {
          width: 90%; max-width: 600px; max-height: 85vh;
          background: rgba(250, 242, 228, 0.98); backdrop-filter: blur(12px);
          border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: modalFadeIn 0.2s ease;
        }
        .native-modal-container.detail-modal { max-width: 550px; }
        .native-modal-container.form-modal { max-width: 700px; }
        .native-modal-container.modal-3d { max-width: 600px; }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .native-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px; border-bottom: 1px solid rgba(170,125,65,0.4);
          background: rgba(250,242,228,0.9);
        }
        .native-modal-header h3 { margin: 0; font-size: 1.2rem; font-weight: 600; color: #4a2a12; }
        .native-modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #8b5a34; padding: 4px 8px; border-radius: 8px; }
        .native-modal-close:hover { background: rgba(170,110,55,0.2); }
        .native-modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
        .detail-modal-body { max-height: 70vh; }
        .form-modal-body { max-height: 65vh; }
        .native-modal-body-3d { padding: 20px; display: flex; justify-content: center; }
        .native-modal-footer {
          display: flex; justify-content: flex-end; gap: 12px;
          padding: 16px 24px; border-top: 1px solid rgba(170,125,65,0.4);
          background: rgba(250,242,228,0.9);
        }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #7a4e28; font-size: 0.85rem; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; padding: 10px 14px; background: rgba(250,245,235,0.9);
          border: 1px solid rgba(170,110,55,0.4); border-radius: 16px;
          font-size: 0.9rem; color: #4a2a12; outline: none; box-sizing: border-box;
        }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .required { color: #c4713a; }
        .detail-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }
        .detail-item { display: flex; align-items: flex-start; gap: 8px; }
        .detail-item.full-width { grid-column: span 2; flex-direction: column; }
        .detail-label { font-weight: 600; color: #7a4e28; min-width: 80px; }
        .detail-value { color: #4a301a; }
        .detail-coord { background: rgba(80,50,20,0.08); padding: 4px 8px; border-radius: 8px; }
        .unity-preview { text-align: center; }
        .preview-placeholder { background: rgba(80,60,40,0.15); border-radius: 24px; padding: 30px; }
        .coord-visual { width: 200px; height: 200px; margin: 20px auto; position: relative; background: rgba(100,70,40,0.1); border-radius: 12px; }
        .axis-line { position: absolute; background: #b87a48; }
        .x-axis { width: 100%; height: 2px; top: 50%; left: 0; }
        .y-axis { width: 2px; height: 100%; top: 0; left: 50%; }
        .z-axis { width: 2px; height: 100%; top: 0; left: 75%; transform: rotate(45deg); }
        .point-marker { position: absolute; top: 50%; left: 50%; color: #c4713a; font-size: 1.5rem; transform: translate(-50%, -50%); }
        .preview-coord { margin-top: 16px; color: #5a341a; }
        .preview-note { font-size: 0.7rem; color: #8b6946; margin-top: 12px; }
        .btn-cancel { background: rgba(170,110,55,0.2); border: 1px solid #bc8f5a; padding: 8px 20px; border-radius: 30px; cursor: pointer; color: #7a4a28; }
        .btn-submit { background: #b87a48; border: none; padding: 8px 20px; border-radius: 30px; color: #fff5e8; cursor: pointer; }
      `
      document.head.appendChild(style)
    }
  }
}
</script>

<style scoped>
.simulation-teaching-view {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  border-left: 5px solid #c27442;
  padding-left: 20px;
}
.page-header i:first-child { font-size: 1.8rem; color: #aa6b3c; }
.page-header h1 { font-size: 1.8rem; font-weight: 500; color: #3e2410; }
.header-badge { margin-left: auto; background: rgba(180,115,55,0.2); padding: 6px 16px; border-radius: 60px; font-size: 0.85rem; border: 1px solid rgba(170,100,40,0.5); color: #5a341a; }
.btn-create { background: linear-gradient(135deg, #b87a48, #9a5e32); border: none; padding: 8px 20px; border-radius: 40px; color: #fff5e8; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-mini-card { background: rgba(250,242,228,0.7); backdrop-filter: blur(6px); border-radius: 24px; padding: 16px 20px; border: 1px solid rgba(190,140,75,0.5); display: flex; align-items: center; gap: 16px; }
.stat-mini-card i { font-size: 2rem; color: #b87a48; }
.stat-num { font-size: 1.6rem; font-weight: 700; color: #4a2a12; }
.stat-label { font-size: 0.75rem; color: #7a5432; }

.toolbar { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
.search-area { flex: 2; background: rgba(250,242,228,0.7); backdrop-filter: blur(4px); border-radius: 48px; padding: 10px 20px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(170,110,55,0.4); }
.search-area input { flex: 1; background: none; border: none; outline: none; font-size: 0.9rem; color: #4a2a12; }
.filter-area { display: flex; gap: 12px; align-items: center; }
.filter-area select { background: rgba(250,242,228,0.7); border: 1px solid rgba(170,110,55,0.4); border-radius: 40px; padding: 10px 20px; font-size: 0.85rem; color: #4a2a12; outline: none; cursor: pointer; }
.filter-btn { background: rgba(170,110,55,0.2); border: 1px solid #bc8f5a; border-radius: 40px; padding: 10px 20px; cursor: pointer; color: #7a4a28; display: flex; align-items: center; gap: 6px; }
.view-toggle { display: flex; gap: 4px; background: rgba(170,110,55,0.15); border-radius: 48px; padding: 4px; }
.toggle-btn { background: none; border: none; padding: 8px 20px; border-radius: 40px; cursor: pointer; color: #7a4a28; display: flex; align-items: center; gap: 6px; }
.toggle-btn.active { background: #b87a48; color: #fff5e8; }

.table-wrapper { overflow-x: auto; }
.acupoint-table { width: 100%; border-collapse: collapse; }
.acupoint-table th, .acupoint-table td { padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(170,125,65,0.3); }
.acupoint-table th { font-weight: 600; color: #7a4e28; background: rgba(200,170,130,0.2); }
.point-code {  font-weight: 600; color: #b87a48; }
.point-name { font-weight: 600; color: #4a2a12; }
.meridian-badge { padding: 4px 12px; border-radius: 30px; font-size: 0.7rem; color: white; }
.coord-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.coord-code { background: rgba(80,50,20,0.08); padding: 4px 8px; border-radius: 8px; font-size: 0.75rem; }
.copy-coord-btn { background: rgba(170,110,55,0.15); border: none; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; color: #8b5a34; }
.action-cell { display: flex; gap: 8px; }
.action-icon { background: rgba(170,110,55,0.15); border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; color: #7a4a28; transition: all 0.2s; }
.action-icon:hover { background: rgba(170,110,55,0.35); }
.location-desc { max-width: 200px; font-size: 0.8rem; color: #5a3a1e; }
.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 0 0; margin-top: 16px; border-top: 1px solid rgba(170,125,65,0.3); }
.pagination { display: flex; gap: 12px; align-items: center; }
.pagination button { background: rgba(170,110,55,0.2); border: none; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

.grid-view { display: flex; flex-direction: column; gap: 20px; }
.acupoint-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.acupoint-card { padding: 18px; background: rgba(250,242,228,0.75); backdrop-filter: blur(8px); border-radius: 24px; }
.acupoint-header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px dashed rgba(170,125,65,0.4); margin-bottom: 12px; }
.point-code-badge { background: #b87a48; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; }
.point-name-large { font-size: 1.1rem; font-weight: 600; color: #4a2a12; }
.point-pinyin { font-size: 0.7rem; color: #8b6946; }
.acupoint-body { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.meridian-info, .coord-info, .location-info { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
.coord-info code { background: rgba(80,50,20,0.08); padding: 4px 8px; border-radius: 8px; font-size: 0.7rem; }
.copy-small { background: none; border: none; cursor: pointer; color: #b87a48; }
.acupoint-footer { display: flex; gap: 12px; padding-top: 12px; border-top: 1px solid rgba(170,125,65,0.3); }
.btn-preview, .btn-detail { flex: 1; padding: 8px; border-radius: 30px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-preview { background: rgba(170,110,55,0.2); border: 1px solid #b87a48; color: #7a4a28; }
.btn-detail { background: #b87a48; border: none; color: white; }
</style>
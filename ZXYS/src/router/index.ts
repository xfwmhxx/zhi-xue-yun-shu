import { createRouter, createWebHistory } from 'vue-router'
// 登录注册页面
import Auth from '@/views/Auth.vue'
// 指导书页面
import Guidebook from '@/views/Guidebook.vue'
// 身份选择页面
import ChooseRole from '@/views/ChooseRole.vue'
// 用户信息初始化页面
import UserInfo from '@/views/UserInfo.vue'
import EntranceTest from '@/views/EntranceTest.vue'
import UserHome from '@/views/UserHome.vue'
import UserPortrait from '@/views/UserPortrait.vue'
import LabIndex from '@/views/LabIndex.vue'
import JobList from '@/views/JobList.vue'
import NotFound from '@/views/NotFound.vue'
import HomePage from '@/views/HomePage.vue'
import ZYCD from '@/views/ZYCD.vue'
import ZYYS from '@/views/ZYYS.vue'
import ZCYJ from '@/views/ZCYJ.vue'
import GJHS from '@/views/GJHS.vue'
import FJPW from '@/views/FJPW.vue'
import ZYSZ from '@/views/ZYSZ.vue'
import AIYS from '@/views/AIYS.vue'
import SimulatedPracticeExercises from '@/views/SimulatedPracticeExercises.vue'
import InterviewResult from '@/views/InterviewResult.vue'
import BookHouse from '@/views/BookHouse.vue'
import AIVideo from '@/views/AIVideo.vue'
import AiVideoIntroduce from '@/views/AiVideoIntroduce.vue'
import MockInterview from '@/views/MockInterview.vue'
import BookIntroduce from '@/views/BookHouse/BookIntroduce.vue'
import BookProblemList from '@/views/BookHouse/BookProblemList.vue'
import BookProblemDetail from '@/views/BookHouse/BookProblemDetail.vue'
import KnowledgeList from '@/views/KnowledgeList.vue'
import PDFReader from '@/views/PDFReader.vue'
import BookshelfSection from '@/views/UserHome/BookshelfSection.vue'
import StudyRecordSection from '@/views/UserHome/StudyRecordSection.vue'
import TodayRecordSection from '@/views/UserHome/TodayRecordSection.vue'
import InterviewSection from '@/views/UserHome/InterviewSection.vue'
import CertificationCentreSection from '@/views/UserHome/CertificationCentreSection.vue'
import ResumeSection from '@/views/UserHome/ResumeSection.vue'
import Test from '@/views/test.vue'
import Manager from '@/views/Manager.vue'

import UnityLab001 from '@/views/UnityLab001.vue'
import UnityLab002 from '@/views/UnityLab002.vue'
import UnityLab003 from '@/views/UnityLab003.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Auth',
      component: Auth,
    },
    {
      path: '/initialize',
      name: 'Initialize',
      children: [
        {
          path: 'guidebook',
          name: 'Guidebook',
          component: Guidebook,
        },
        {
          path: 'chooserole',
          name: 'ChooseRole',
          component: ChooseRole,
        },
        {
          path: 'userinfo/:id',
          name: 'UserInfo',
          component: UserInfo,
        },
        {
          path: 'entrancetest/:id',
          name: 'EntranceTest',
          component: EntranceTest,
        },
      ],
    },

    {
      path: '/Foundations',
      name: 'Foundations',
      children: [
        {
          path: 'userhome',
          name: 'UserHome',
          component: UserHome,
          children: [
            {
              path: '',
              name: 'StudyRecordSection',
              component: StudyRecordSection,
            },
            {
              path: 'bookshelf',
              name: 'BookshelfSection',
              component: BookshelfSection,
            },
            {
              path: 'todayrecord',
              name: 'TodayRecordSection',
              component: TodayRecordSection,
            },
            {
              path: 'resume',
              name: 'ResumeSection',
              component: ResumeSection,
            },
            {
              path: 'interview',
              name: 'InterviewSection',
              component: InterviewSection,
            },
            {
              path: 'certification',
              name: 'CertificationCentreSection',
              component: CertificationCentreSection,
            },
          ],
        },
        {
          path: 'homepage',
          name: 'HomePage',
          component: HomePage,
        },
        {
          path: 'joblist',
          name: 'JobList',
          component: JobList,
        },
        {
          path: 'AIVideo',
          name: 'AIVideo',
          component: AIVideo,
        },
        {
          path: 'labindex',
          name: 'LabIndex',
          component: LabIndex,
        },
        {
          path: 'bookhouse',
          name: 'BookHouse',
          component: BookHouse,
        },
      ],
    },
    {
      path: '/Hina',
      name: 'Hina',
      children: [
        {
          path: 'userportrait',
          name: 'UserPortrait',
          component: UserPortrait,
        },
        {
          path: 'ZYCD',
          name: 'ZYCD',
          component: ZYCD,
        },
        {
          path: 'ZYYS',
          name: 'ZYYS',
          component: ZYYS,
        },
        {
          path: 'ZCYJ',
          name: 'ZCYJ',
          component: ZCYJ,
        },
        {
          path: 'GJHS',
          name: 'GJHS',
          component: GJHS,
        },
        {
          path: 'FJPW',
          name: 'FJPW',
          component: FJPW,
        },
        {
          path: 'ZYSZ',
          name: 'ZYSZ',
          component: ZYSZ,
        },
        {
          path: 'AIYS',
          name: 'AIYS',
          component: AIYS,
        },
        {
          path: 'BookIntroduce/:id',
          name: 'BookIntroduce',
          component: BookIntroduce,
        },
        {
          path: 'BookPDFReader/:id',
          name: 'PDFReader',
          component: PDFReader,
        },
        {
          path: 'BookProblemList/:id/:chapterid',
          name: 'BookProblemList',
          component: BookProblemList,
        },
        {
          path: 'BookProblemDetail/:id/:chapterid/:probId',
          name: 'BookProblemDetail',
          component: BookProblemDetail,
        },
        {
          path: 'MockInterview',
          name: 'MockInterview',
          component: MockInterview,
        },
        {
          path: 'interviewResult/:id',
          name: 'InterviewResult',
          component: InterviewResult,
        },
        {
          path: 'AIVideoIntroduce/:id',
          name: 'AiVideoIntroduce',
          component: AiVideoIntroduce,
        },
        {
          path: 'SimulatedPracticeExercises',
          name: 'SimulatedPracticeExercises',
          component: SimulatedPracticeExercises,
        },
        {
          path: 'knowledgelist',
          name: 'KnowledgeList',
          component: KnowledgeList,
        },
      ],
    },
    {
      path: '/Unity',
      name: 'Unity',
      children: [
        {
          path: 'Lab001',
          name: 'UnityLab001',
          component: UnityLab001,
        },
        {
          path: 'Lab002',
          name: 'UnityLab002',
          component: UnityLab002,
        },
        {
          path: 'Lab003',
          name: 'UnityLab003',
          component: UnityLab003,
        },
      ],
    },
    {
      path: '/test',
      name: 'TEST',
      component: Test,
    },
    {
      path: '/Manager',
      name: 'Manager',
      component: Manager,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router

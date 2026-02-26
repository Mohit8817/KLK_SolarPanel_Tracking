export const MenuList = [
    // Dashboard
    {
        title: 'Dashboard',
        classsChange: '',
        iconStyle: <i className="flaticon-025-dashboard"></i>,
        to: 'dashboard',
    },


    // Panel Generation
    {
        title: 'Panel Generation',
        classsChange: 'mm-collapse',
        iconStyle: <i className="fa-solid fa-solar-panel fw-bold" />,
        content: [
            {
                title: 'Generate Panel',
                to: 'panel/generate',
            },
            {
                title: 'View Panel List',
                to: 'generate/panel/list',
            },
        ],
    },

    // Production
    {
        title: 'Production',
        classsChange: 'mm-collapse',
        iconStyle: <i className="fa-solid fa-industry fw-bold" />,
        content: [
            {
                title: 'Add Production',
                to: 'production/add',
            },
            {
                title: 'View Production List',
                to: 'production/list',
            },
            {
                title: 'Add Damage',
                to: 'production-damage/add',
            },
            {
                title: 'Damage List',
                to: 'production-damage/list',
            },
        ],
    },


    // Dispatch Panel
    {
        title: "Dispatch Panel",
        classsChange: 'mm-collapse',
        iconStyle: <i className="fa-solid fa-truck-fast fw-bold" />,
        content: [
            {
                title: 'Dispatch Panel',
                to: '/dispatch/create',
            },
            {
                title: 'View Dispatch List',
                to: '/dispatch/list',
            },
            {
                title: 'Add Damage',
                to: 'sender/damage/create',
            },

            {
                title: 'View Damage List',
                to: '/damage/list',
            },
        ],
    },

    // Receive Panel
    {
        title: "Receive Panel",
        classsChange: 'mm-collapse',
        iconStyle: <i className="fa-solid fa-truck-ramp-box fw-bold" />,
        content: [
            {
                title: 'View Safe Panels',
                to: 'receiver/safe/list',
            },
           {
                title: 'Add Damage Panel',
                to: 'receiver/damage/create',
            },
            {
                title: 'View Damage List',
                to: 'receiver/damage/list',
            },
        ],
    },

    // User Management
    {
        title: "User Management",
        classsChange: 'mm-collapse',
        iconStyle: <i className="fa-solid fa-users fw-bold" />,
        content: [
            {
                title: 'Add User',
                to: '/user/add',
            },
            {
                title: 'View Users',
                to: '/user/list',
            },
        ],
    },




]
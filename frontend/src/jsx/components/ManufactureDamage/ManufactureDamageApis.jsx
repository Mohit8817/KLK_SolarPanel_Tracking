export const getAllManufactureDamage = async () => {

  return {
    data: {
      data: [
        {
          _id: "1",
          panel_no: "KLK001",
          damage_type: "Crack",
          remarks: "Glass crack",
          date: "2026-02-21",
        },
        {
          _id: "2",
          panel_no: "KLK002",
          damage_type: "Scratch",
          remarks: "Minor scratch",
          date: "2026-02-21",
        },
        {
          _id: "3",
          panel_no: "KLK003",
          damage_type: "Broken Glass",
          remarks: "Broken",
          date: "2026-02-22",
        },
      ],
    },
  };
};

export const deleteManufactureDamage = async () => {
  return true;
};
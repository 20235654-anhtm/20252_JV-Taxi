export const getNearbyDrivers = async () => {
  try {
    const mockDrivers = [
      {
        id: 1,
        name: "Nguyen Tan",
        car: "Toyota Camry • ホワイト",
        distance: "1.2 KM",
        time: "4分",
        price: "145k",
        rating: 4.9,
        avatar: "https://placehold.co/80x80"
      },
      {
        id: 2,
        name: "Tran Minh",
        car: "Honda CR-V • ブラック",
        distance: "0.8 KM",
        time: "2分",
        price: "132k",
        rating: 4.8,
        avatar: "https://placehold.co/80x80"
      },
      {
        id: 3,
        name: "Le Hang",
        car: "VinFast VF8 • ブルー",
        distance: "2.5 KM",
        time: "6分",
        price: "160k",
        rating: 5.0,
        avatar: "https://placehold.co/80x80"
      }
    ];
    return mockDrivers;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài xế:", error);
    throw new Error("Không thể lấy danh sách tài xế");
  }
};
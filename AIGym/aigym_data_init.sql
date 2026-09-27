-- ==========================================================
-- AIGym Database Initialization Script
-- Description: Comprehensive standard nutrition and exercise data
-- ==========================================================

-- --------------------------------------------------------
-- 1. NUTRITION DATA (food_items)
-- --------------------------------------------------------

INSERT INTO food_items (created_at, created_by_name, is_deleted, name, brand, calories_per100g, protein, carbs, fat, fiber, is_public, user_id) VALUES
-- Nhóm Thịt, Gia cầm & Thủy hải sản
(NOW(), 'System Admin', false, 'Ức gà (sống)', 'AIGym Standard', 110, 23.0, 0.0, 1.2, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Ức gà (áp chảo/luộc)', 'AIGym Standard', 165, 31.0, 0.0, 3.6, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Thịt đùi gà (bỏ da)', 'AIGym Standard', 120, 20.0, 0.0, 4.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Thịt bò (nạc)', 'AIGym Standard', 250, 26.0, 0.0, 15.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Thịt thăn bò', 'AIGym Standard', 155, 22.0, 0.0, 7.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Thịt heo thăn (nạc)', 'AIGym Standard', 143, 26.0, 0.0, 3.5, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Thịt lợn nạc vai', 'AIGym Standard', 180, 20.0, 0.0, 11.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Lườn vịt (bỏ da)', 'AIGym Standard', 140, 21.0, 0.0, 6.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá hồi (sống)', 'AIGym Standard', 208, 20.0, 0.0, 13.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá ngừ đóng hộp (ngâm nước)', 'AIGym Standard', 116, 26.0, 0.0, 1.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá ngừ tươi', 'AIGym Standard', 130, 28.0, 0.0, 1.5, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá basa phi lê', 'AIGym Standard', 90, 15.0, 0.0, 3.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá thu tươi', 'AIGym Standard', 205, 19.0, 0.0, 14.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá lóc (cá quả)', 'AIGym Standard', 97, 18.2, 0.0, 2.7, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá rô đồng', 'AIGym Standard', 100, 19.1, 0.0, 2.6, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Tôm hấp/luộc', 'AIGym Standard', 99, 24.0, 0.2, 0.3, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Mực ống tươi', 'AIGym Standard', 92, 15.6, 3.1, 1.4, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cua biển', 'AIGym Standard', 87, 17.5, 0.0, 1.8, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Nghêu/Ngao', 'AIGym Standard', 74, 12.8, 2.6, 1.0, 0.0, true, NULL),

-- Nhóm Trứng & Sữa / Whey
(NOW(), 'System Admin', false, 'Trứng gà (luộc)', 'AIGym Standard', 155, 13.0, 1.1, 11.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Lòng trắng trứng gà', 'AIGym Standard', 52, 11.0, 0.7, 0.2, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Trứng vịt', 'AIGym Standard', 185, 12.8, 1.0, 13.8, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Sữa tươi không đường', 'Vinamilk', 62, 3.0, 4.7, 3.3, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Sữa tươi tách béo', 'Vinamilk', 35, 3.4, 5.0, 0.1, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Sữa chua không đường', 'Vinamilk', 61, 3.5, 4.7, 3.2, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Sữa chua Hy Lạp', 'AIGym Standard', 59, 10.0, 3.6, 0.4, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Phô mai Cottage', 'AIGym Standard', 98, 11.0, 3.4, 4.3, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Phô mai Con Bò Cười', 'Bel', 240, 11.0, 5.0, 20.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Whey Protein Isolate', 'Optimum Nutrition', 377, 80.0, 3.0, 1.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Whey Protein Gold Standard', 'Optimum Nutrition', 377, 78.0, 9.4, 3.1, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Mass Gainer', 'AIGym Standard', 380, 20.0, 70.0, 2.5, 1.0, true, NULL),

-- Nhóm Tinh bột & Đậu/Hạt
(NOW(), 'System Admin', false, 'Gạo lứt (chưa nấu)', 'AIGym Standard', 360, 7.3, 76.0, 2.9, 3.5, true, NULL),
(NOW(), 'System Admin', false, 'Cơm gạo lứt (chín)', 'AIGym Standard', 112, 2.6, 23.5, 0.9, 1.8, true, NULL),
(NOW(), 'System Admin', false, 'Gạo trắng (chưa nấu)', 'AIGym Standard', 365, 7.1, 79.0, 0.6, 1.3, true, NULL),
(NOW(), 'System Admin', false, 'Cơm trắng (chín)', 'AIGym Standard', 130, 2.7, 28.0, 0.3, 0.4, true, NULL),
(NOW(), 'System Admin', false, 'Khoai lang (luộc)', 'AIGym Standard', 86, 1.6, 20.1, 0.1, 3.0, true, NULL),
(NOW(), 'System Admin', false, 'Khoai tây (luộc)', 'AIGym Standard', 87, 1.9, 20.1, 0.1, 1.8, true, NULL),
(NOW(), 'System Admin', false, 'Yến mạch (cán dẹt)', 'Quaker', 389, 16.9, 66.3, 6.9, 10.6, true, NULL),
(NOW(), 'System Admin', false, 'Bánh mì đen / Nguyên cám', 'AIGym Standard', 250, 9.0, 48.0, 3.3, 6.0, true, NULL),
(NOW(), 'System Admin', false, 'Bánh mì trắng', 'AIGym Standard', 265, 9.0, 49.0, 3.2, 2.7, true, NULL),
(NOW(), 'System Admin', false, 'Bún tươi', 'AIGym Standard', 110, 1.7, 25.7, 0.1, 0.5, true, NULL),
(NOW(), 'System Admin', false, 'Phở tươi', 'AIGym Standard', 123, 2.1, 28.0, 0.2, 0.4, true, NULL),
(NOW(), 'System Admin', false, 'Mì gói (chưa nấu)', 'AIGym Standard', 450, 9.0, 64.0, 18.0, 2.0, true, NULL),
(NOW(), 'System Admin', false, 'Đậu hũ trắng', 'AIGym Standard', 76, 8.1, 1.9, 4.8, 0.3, true, NULL),
(NOW(), 'System Admin', false, 'Đậu nành (luộc)', 'AIGym Standard', 173, 16.6, 9.9, 9.0, 6.0, true, NULL),
(NOW(), 'System Admin', false, 'Đậu đen (luộc)', 'AIGym Standard', 132, 8.9, 23.7, 0.5, 8.7, true, NULL),
(NOW(), 'System Admin', false, 'Đậu đỏ (luộc)', 'AIGym Standard', 127, 8.7, 22.8, 0.5, 6.4, true, NULL),
(NOW(), 'System Admin', false, 'Đậu Hà Lan', 'AIGym Standard', 81, 5.4, 14.5, 0.4, 5.7, true, NULL),
(NOW(), 'System Admin', false, 'Hạnh nhân', 'AIGym Standard', 579, 21.1, 21.6, 49.9, 12.5, true, NULL),
(NOW(), 'System Admin', false, 'Hạt óc chó', 'AIGym Standard', 654, 15.2, 13.7, 65.2, 6.7, true, NULL),
(NOW(), 'System Admin', false, 'Hạt điều', 'AIGym Standard', 553, 18.2, 30.2, 43.8, 3.3, true, NULL),
(NOW(), 'System Admin', false, 'Hạt chia', 'AIGym Standard', 486, 16.5, 42.1, 30.7, 34.4, true, NULL),
(NOW(), 'System Admin', false, 'Bơ đậu phộng', 'AIGym Standard', 588, 25.0, 20.0, 50.0, 6.0, true, NULL),
(NOW(), 'System Admin', false, 'Dầu olive', 'AIGym Standard', 884, 0.0, 0.0, 100.0, 0.0, true, NULL),

-- Nhóm Rau củ & Trái cây
(NOW(), 'System Admin', false, 'Bông cải xanh (luộc)', 'AIGym Standard', 35, 2.4, 7.2, 0.4, 3.3, true, NULL),
(NOW(), 'System Admin', false, 'Rau bina (Cải bó xôi)', 'AIGym Standard', 23, 2.9, 3.6, 0.4, 2.2, true, NULL),
(NOW(), 'System Admin', false, 'Măng tây', 'AIGym Standard', 20, 2.2, 3.9, 0.1, 2.1, true, NULL),
(NOW(), 'System Admin', false, 'Dưa chuột', 'AIGym Standard', 15, 0.7, 3.6, 0.1, 0.5, true, NULL),
(NOW(), 'System Admin', false, 'Cà chua', 'AIGym Standard', 18, 0.9, 3.9, 0.2, 1.2, true, NULL),
(NOW(), 'System Admin', false, 'Bắp cải (luộc)', 'AIGym Standard', 23, 1.3, 5.5, 0.1, 1.9, true, NULL),
(NOW(), 'System Admin', false, 'Rau muống (luộc)', 'AIGym Standard', 20, 3.2, 2.1, 0.3, 1.0, true, NULL),
(NOW(), 'System Admin', false, 'Rau ngót', 'AIGym Standard', 35, 5.3, 3.4, 0.0, 2.5, true, NULL),
(NOW(), 'System Admin', false, 'Chuối', 'AIGym Standard', 89, 1.1, 22.8, 0.3, 2.6, true, NULL),
(NOW(), 'System Admin', false, 'Táo', 'AIGym Standard', 52, 0.3, 13.8, 0.2, 2.4, true, NULL),
(NOW(), 'System Admin', false, 'Bơ quả', 'AIGym Standard', 160, 2.0, 8.5, 14.7, 6.7, true, NULL),
(NOW(), 'System Admin', false, 'Quả việt quất', 'AIGym Standard', 57, 0.7, 14.5, 0.3, 2.4, true, NULL),
(NOW(), 'System Admin', false, 'Dâu tây', 'AIGym Standard', 32, 0.7, 7.7, 0.3, 2.0, true, NULL),
(NOW(), 'System Admin', false, 'Dưa hấu', 'AIGym Standard', 30, 0.6, 7.6, 0.2, 0.4, true, NULL),
(NOW(), 'System Admin', false, 'Cam tươi', 'AIGym Standard', 47, 0.9, 11.8, 0.1, 2.4, true, NULL),
(NOW(), 'System Admin', false, 'Bưởi', 'AIGym Standard', 38, 0.8, 9.6, 0.1, 1.0, true, NULL),
(NOW(), 'System Admin', false, 'Ổi', 'AIGym Standard', 68, 2.6, 14.3, 1.0, 5.4, true, NULL);


-- --------------------------------------------------------
-- 2. EXERCISE DATA (exercises)
-- --------------------------------------------------------

INSERT INTO exercises (created_at, created_by_name, is_deleted, name, description, primary_category, difficulty, equipment, image_url, video_url, created_by_user_id, is_public) VALUES
-- NGỰC (CHEST)
(NOW(), 'System Admin', false, 'Barbell Bench Press', 'Nằm trên ghế phẳng. Nắm thanh tạ đòn, hạ từ từ xuống ngang ngực rồi đẩy mạnh lên.', 'CHEST_MIDDLE', 'NORMAL', 'Thanh tạ đòn, Ghế phẳng', 'https://example.com/bench_press.jpg', 'https://example.com/bench_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Dumbbell Bench Press', 'Nằm trên ghế phẳng, dùng 2 tạ đơn đẩy lên vuông góc ngực. Giúp phạm vi chuyển động sâu hơn.', 'CHEST_MIDDLE', 'NORMAL', 'Tạ đơn, Ghế phẳng', 'https://example.com/db_bench_press.jpg', 'https://example.com/db_bench_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Incline Barbell Press', 'Nằm ghế dốc lên 30-45 độ, đẩy thanh tạ đòn tập trung phát triển cơ ngực trên.', 'CHEST_UPPER', 'NORMAL', 'Thanh tạ đòn, Ghế dốc', 'https://example.com/incline_barbell.jpg', 'https://example.com/incline_barbell.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Incline Dumbbell Press', 'Nằm ghế dốc lên. Dùng 2 tạ đơn đẩy từ ngang ngực trên lên cao, siết chặt cơ ngực trên.', 'CHEST_UPPER', 'NORMAL', 'Tạ đơn, Ghế dốc', 'https://example.com/incline_press.jpg', 'https://example.com/incline_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Decline Barbell Press', 'Nằm ghế dốc xuống, đẩy thanh tạ đòn tác động chính vào vùng cơ ngực dưới.', 'CHEST_LOWER', 'NORMAL', 'Thanh tạ đòn, Ghế dốc xuống', 'https://example.com/decline_barbell.jpg', 'https://example.com/decline_barbell.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Dips for Chest (Xà kép ngực)', 'Nghiêng người về phía trước trên xà kép, hạ sâu và đẩy người lên tập trung cơ ngực dưới.', 'CHEST_LOWER', 'HARD', 'Xà kép', 'https://example.com/dips.jpg', 'https://example.com/dips.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Dumbbell Flyes', 'Nằm ngửa ghế phẳng, hai tay cầm tạ đơn mở rộng sang hai bên rồi ép lại về giữa ngực.', 'CHEST_MIDDLE', 'EASY', 'Tạ đơn, Ghế phẳng', 'https://example.com/db_flyes.jpg', 'https://example.com/db_flyes.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Cable Crossover', 'Đứng giữa máy cáp cao, kéo hai tay cáp chéo xuống trước ngực để cô lập cơ ngực.', 'CHEST_MIDDLE', 'EASY', 'Máy cáp', 'https://example.com/cable_crossover.jpg', 'https://example.com/cable_crossover.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Pec Deck Fly (Máy ép ngực)', 'Ngồi vào máy Pec Deck, dùng hai cùi chỏ/tay ép thanh đệm vào giữa ngực.', 'CHEST_MIDDLE', 'EASY', 'Máy Pec Deck', 'https://example.com/pec_deck.jpg', 'https://example.com/pec_deck.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Push Up (Hít đất)', 'Chống hai tay xuống sàn rộng hơn vai. Hạ người gần chạm sàn rồi đẩy lên.', 'CHEST_MIDDLE', 'NORMAL', 'Không dụng cụ', 'https://example.com/push_up.jpg', 'https://example.com/push_up.mp4', NULL, true),

-- LƯNG & XÔ (LATS / BACK)
(NOW(), 'System Admin', false, 'Pull Up (Hít xà đơn)', 'Nắm xà đơn rộng hơn vai. Kéo người lên đến khi cằm vượt qua xà.', 'LATS', 'HARD', 'Xà đơn', 'https://example.com/pull_up.jpg', 'https://example.com/pull_up.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Chin Up (Hít xà ngược tay)', 'Nắm xà đơn lòng bàn tay hướng vào người, kéo người lên tập trung xô dưới và tay trước.', 'LATS', 'HARD', 'Xà đơn', 'https://example.com/chin_up.jpg', 'https://example.com/chin_up.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Lat Pulldown', 'Ngồi máy kéo xà, kéo thanh cáp xuống sát ngực trên rồi thả lên từ từ.', 'LATS', 'NORMAL', 'Máy cáp', 'https://example.com/lat_pulldown.jpg', 'https://example.com/lat_pulldown.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Bent Over Barbell Row', 'Cúi người lưng thẳng nghiêng 45 độ, kéo thanh tạ đòn sát về bụng dưới.', 'LATS', 'HARD', 'Thanh tạ đòn', 'https://example.com/barbell_row.jpg', 'https://example.com/barbell_row.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Single Arm Dumbbell Row', 'Một tay chống ghế, tay kia cầm tạ đơn kéo sát mông chèo thuyền.', 'LATS', 'NORMAL', 'Tạ đơn, Ghế phẳng', 'https://example.com/single_db_row.jpg', 'https://example.com/single_db_row.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Seated Cable Row', 'Ngồi kéo cáp ngang, lưng thẳng, kéo tay cầm về sát bụng dưới siết lưng.', 'LATS', 'NORMAL', 'Máy cáp', 'https://example.com/cable_row.jpg', 'https://example.com/cable_row.mp4', NULL, true),
(NOW(), 'System Admin', false, 'T-Bar Row', 'Kẹp thanh tạ T-Bar giữa hai chân, cúi người kéo tạ về phía ngực/bụng.', 'LATS', 'HARD', 'Thanh T-Bar / Tạ đòn', 'https://example.com/tbar_row.jpg', 'https://example.com/tbar_row.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Conventional Deadlift', 'Đứng thẳng trước tạ, hạ hông cầm tạ, dùng lực chân và đùi sau đẩy đất nâng tạ duỗi thẳng hông.', 'HAMSTRINGS', 'HARD', 'Thanh tạ đòn', 'https://example.com/deadlift.jpg', 'https://example.com/deadlift.mp4', NULL, true),

-- VAI (SHOULDERS)
(NOW(), 'System Admin', false, 'Overhead Barbell Press (OHP)', 'Đứng thẳng, đẩy thanh tạ đòn từ trước ngực lên qua đầu duỗi thẳng tay.', 'SHOULDERS_FRONT', 'HARD', 'Thanh tạ đòn', 'https://example.com/ohp.jpg', 'https://example.com/ohp.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Dumbbell Shoulder Press', 'Ngồi ghế tựa lưng, đẩy 2 tạ đơn qua đầu tác động mạnh vào vai trước và giữa.', 'SHOULDERS_FRONT', 'NORMAL', 'Tạ đơn, Ghế tựa', 'https://example.com/shoulder_press.jpg', 'https://example.com/shoulder_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Arnold Press', 'Ngồi đẩy tạ đơn kết hợp xoay cổ tay từ hướng vào người ra ngoài khi đẩy lên.', 'SHOULDERS_FRONT', 'NORMAL', 'Tạ đơn', 'https://example.com/arnold_press.jpg', 'https://example.com/arnold_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Lateral Raise', 'Đứng thẳng nâng 2 tạ đơn sang hai bên tay song song mặt sàn cô lập vai giữa.', 'SHOULDERS_SIDE', 'EASY', 'Tạ đơn', 'https://example.com/lateral_raise.jpg', 'https://example.com/lateral_raise.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Cable Lateral Raise', 'Kéo cáp đơn một tay sang bên hông giúp lực duy trì liên tục lên cơ vai giữa.', 'SHOULDERS_SIDE', 'EASY', 'Máy cáp', 'https://example.com/cable_lateral.jpg', 'https://example.com/cable_lateral.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Front Raise', 'Đứng nâng từng tạ đơn hoặc thanh tạ về phía trước mặt cô lập vai trước.', 'SHOULDERS_FRONT', 'EASY', 'Tạ đơn / Thanh tạ', 'https://example.com/front_raise.jpg', 'https://example.com/front_raise.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Face Pull', 'Kéo dây thừng cáp cao về phía trán, mở rộng cùi chỏ tập vai sau và lưng trên.', 'SHOULDERS_REAR', 'EASY', 'Máy cáp, Dây thừng', 'https://example.com/face_pull.jpg', 'https://example.com/face_pull.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Reverse Cable Flyes', 'Đứng giữa máy cáp, bắt chéo hai tay kéo sang hai bên tập vai sau.', 'SHOULDERS_REAR', 'EASY', 'Máy cáp', 'https://example.com/reverse_fly.jpg', 'https://example.com/reverse_fly.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Barbell Shrug', 'Đứng cầm tạ nhún vai lên cao về phía tai tập cơ cầu vai (Trapezius).', 'TRAPS_UPPER', 'EASY', 'Thanh tạ đòn / Tạ đơn', 'https://example.com/shrug.jpg', 'https://example.com/shrug.mp4', NULL, true),

-- TAY TRƯỚC & TAY SAU (BICEPS / TRICEPS)
(NOW(), 'System Admin', false, 'Barbell Bicep Curl', 'Đứng thẳng cầm thanh tạ đòn cuốn lên phía ngực bằng cùi chỏ.', 'BICEPS', 'EASY', 'Thanh tạ đòn', 'https://example.com/bicep_curl.jpg', 'https://example.com/bicep_curl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Dumbbell Alternate Curl', 'Đứng cuốn tạ đơn luân phiên từng tay xoay cùi chỏ siết cơ tay trước.', 'BICEPS', 'EASY', 'Tạ đơn', 'https://example.com/db_curl.jpg', 'https://example.com/db_curl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Hammer Curl', 'Cầm tạ đơn lòng bàn tay hướng vào nhau cuốn lên như đập búa tập cẳng tay và tay trước.', 'BICEPS', 'EASY', 'Tạ đơn', 'https://example.com/hammer_curl.jpg', 'https://example.com/hammer_curl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Preacher Curl', 'Đặt tay lên ghế Scott Preacher cuốn thanh tạ EZ cô lập hoàn toàn cơ tay trước.', 'BICEPS', 'EASY', 'Ghế Preacher, Thanh EZ', 'https://example.com/preacher_curl.jpg', 'https://example.com/preacher_curl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Tricep Rope Pushdown', 'Đứng nhấn dây thừng cáp xuống thẳng tay siết chặt cơ tay sau.', 'TRICEPS', 'EASY', 'Máy cáp, Dây thừng', 'https://example.com/tricep_pushdown.jpg', 'https://example.com/tricep_pushdown.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Skull Crusher', 'Nằm ghế phẳng, gập cùi chỏ hạ thanh tạ EZ về trán rồi duỗi thẳng tay.', 'TRICEPS', 'NORMAL', 'Thanh EZ, Ghế phẳng', 'https://example.com/skull_crusher.jpg', 'https://example.com/skull_crusher.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Overhead Dumbbell Extension', 'Cầm 1 quả tạ đơn bằng 2 tay giơ qua đầu, hạ tạ sau cổ rồi đẩy thẳng lên.', 'TRICEPS', 'EASY', 'Tạ đơn', 'https://example.com/overhead_tricep.jpg', 'https://example.com/overhead_tricep.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Close Grip Bench Press', 'Nằm ghế phẳng đẩy thanh tạ đòn với khoảng cách hai tay hẹp bằng vai tập tay sau.', 'TRICEPS', 'NORMAL', 'Thanh tạ đòn, Ghế phẳng', 'https://example.com/close_grip_bench.jpg', 'https://example.com/close_grip_bench.mp4', NULL, true),

-- ĐÙI TRƯỚC, ĐÙI SAU, MÔNG & BẮP CHÂN (LEGS / GLUTES)
(NOW(), 'System Admin', false, 'Barbell Squat', 'Gánh thanh tạ đòn vai sau, hạ mông xuống thấp lưng thẳng đẩy mạnh đứng lên.', 'QUADS', 'HARD', 'Thanh tạ đòn, Giá đỡ', 'https://example.com/squat.jpg', 'https://example.com/squat.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Front Squat', 'Gánh thanh tạ đòn phía trước ngực/vai trước, tập trung tối đa vào đùi trước.', 'QUADS', 'HARD', 'Thanh tạ đòn', 'https://example.com/front_squat.jpg', 'https://example.com/front_squat.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Leg Press', 'Ngồi máy Leg Press, đạp bàn đạp rộng bằng vai đẩy khối lượng nặng.', 'QUADS', 'NORMAL', 'Máy Leg Press', 'https://example.com/leg_press.jpg', 'https://example.com/leg_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Leg Extension', 'Ngồi máy đá đùi, dùng lực đùi trước đá cẳng chân lên thẳng siết cơ.', 'QUADS', 'EASY', 'Máy Leg Extension', 'https://example.com/leg_extension.jpg', 'https://example.com/leg_extension.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Bulgarian Split Squat', 'Một chân đặt lên ghế phía sau, cầm tạ đơn hạ người thẳng đứng tập từng bên đùi/mông.', 'QUADS', 'HARD', 'Tạ đơn, Ghế phẳng', 'https://example.com/bss.jpg', 'https://example.com/bss.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Lunge (Bước gập gối)', 'Bước một chân về phía trước gập gối 90 độ rồi bước trở lại vị trí ban đầu.', 'QUADS', 'NORMAL', 'Tạ đơn / Không dụng cụ', 'https://example.com/lunge.jpg', 'https://example.com/lunge.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Romanian Deadlift (RDL)', 'Đẩy hông về sau, hạ tạ sát chân cảm nhận cơ đùi sau căng rồi đứng thẳng siết mông.', 'HAMSTRINGS', 'NORMAL', 'Thanh tạ đòn / Tạ đơn', 'https://example.com/rdl.jpg', 'https://example.com/rdl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Lying Leg Curl', 'Nằm úp máy móc đùi, dùng cơ đùi sau móc thanh đệm về mông.', 'HAMSTRINGS', 'EASY', 'Máy Leg Curl', 'https://example.com/lying_leg_curl.jpg', 'https://example.com/lying_leg_curl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Hip Thrust', 'Tựa lưng ghế ngang, đặt tạ đòn lên hông đẩy mông lên cao vuông góc sàn siết chặt cơ mông.', 'GLUTES', 'HARD', 'Thanh tạ đòn, Ghế phẳng', 'https://example.com/hip_thrust.jpg', 'https://example.com/hip_thrust.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Standing Calf Raise', 'Đứng nhón gót chân lên cao hết mức cô lập cơ bắp chân.', 'CALVES', 'EASY', 'Bục gỗ / Máy Calf Raise', 'https://example.com/calf_raise.jpg', 'https://example.com/calf_raise.mp4', NULL, true),

-- CƠ BỤNG & CORE (ABS / CORE)
(NOW(), 'System Admin', false, 'Plank', 'Chống cùi chỏ duỗi thẳng người như tấm ván gồng chặt cơ bụng và mông.', 'CORE', 'NORMAL', 'Không dụng cụ', 'https://example.com/plank.jpg', 'https://example.com/plank.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Crunch (Gập bụng)', 'Nằm ngửa gập gối, dùng cơ bụng cuộn phần vai lên khỏi thảm.', 'ABS_UPPER', 'EASY', 'Thảm tập', 'https://example.com/crunch.jpg', 'https://example.com/crunch.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Hanging Leg Raise', 'Đu xà đơn dùng cơ bụng dưới nhấc 2 chân thẳng hoặc gập gối lên ngực.', 'ABS_LOWER', 'HARD', 'Xà đơn', 'https://example.com/hanging_leg_raise.jpg', 'https://example.com/hanging_leg_raise.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Russian Twist', 'Ngồi nhấc chân xoay thân người sang 2 bên luyện cơ bụng liên sườn.', 'CORE', 'NORMAL', 'Bánh tạ / Thảm', 'https://example.com/russian_twist.jpg', 'https://example.com/russian_twist.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Ab Wheel Rollout', 'Dùng con lăn gập bụng đẩy người ra xa rồi cuộn cơ bụng kéo về.', 'CORE', 'HARD', 'Con lăn Ab Wheel', 'https://example.com/ab_wheel.jpg', 'https://example.com/ab_wheel.mp4', NULL, true);

-- ==========================================================
-- END OF SCRIPT
-- ==========================================================

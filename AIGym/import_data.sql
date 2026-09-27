-- ==========================================================
-- AIGym Database Initialization Script
-- Description: Import standard nutrition and exercise data
-- ==========================================================

-- --------------------------------------------------------
-- 1. NUTRITION DATA (food_items)
-- --------------------------------------------------------

INSERT INTO food_items (created_at, created_by_name, is_deleted, name, brand, calories_per100g, protein, carbs, fat, fiber, is_public, user_id) VALUES
(NOW(), 'System Admin', false, 'Ức gà (sống)', 'AIGym Standard', 110, 23.0, 0.0, 1.2, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Trứng gà (luộc)', 'AIGym Standard', 155, 13.0, 1.1, 11.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Gạo lứt (chưa nấu)', 'AIGym Standard', 360, 7.3, 76.0, 2.9, 3.5, true, NULL),
(NOW(), 'System Admin', false, 'Gạo trắng (chưa nấu)', 'AIGym Standard', 130, 2.7, 28.0, 0.3, 0.4, true, NULL),
(NOW(), 'System Admin', false, 'Khoai lang (luộc)', 'AIGym Standard', 86, 1.6, 20.1, 0.1, 3.0, true, NULL),
(NOW(), 'System Admin', false, 'Yến mạch (cán dẹt)', 'AIGym Standard', 389, 16.9, 66.3, 6.9, 10.6, true, NULL),
(NOW(), 'System Admin', false, 'Thịt bò (nạc)', 'AIGym Standard', 250, 26.0, 0.0, 15.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Cá hồi (sống)', 'AIGym Standard', 208, 20.0, 0.0, 13.0, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Bơ đậu phộng', 'AIGym Standard', 588, 25.0, 20.0, 50.0, 6.0, true, NULL),
(NOW(), 'System Admin', false, 'Chuối', 'AIGym Standard', 89, 1.1, 22.8, 0.3, 2.6, true, NULL),
(NOW(), 'System Admin', false, 'Táo', 'AIGym Standard', 52, 0.3, 13.8, 0.2, 2.4, true, NULL),
(NOW(), 'System Admin', false, 'Bông cải xanh (luộc)', 'AIGym Standard', 35, 2.4, 7.2, 0.4, 3.3, true, NULL),
(NOW(), 'System Admin', false, 'Hạnh nhân', 'AIGym Standard', 579, 21.1, 21.6, 49.9, 12.5, true, NULL),
(NOW(), 'System Admin', false, 'Sữa tươi không đường', 'Vinamilk', 62, 3.0, 4.7, 3.3, 0.0, true, NULL),
(NOW(), 'System Admin', false, 'Whey Protein', 'Optimum Nutrition', 377, 78.0, 9.4, 3.1, 0.0, true, NULL);


-- --------------------------------------------------------
-- 2. EXERCISE DATA (exercises)
-- --------------------------------------------------------

INSERT INTO exercises (created_at, created_by_name, is_deleted, name, description, primary_category, difficulty, equipment, image_url, video_url, created_by_user_id, is_public) VALUES
(NOW(), 'System Admin', false, 'Barbell Bench Press', 'Nằm trên ghế phẳng. Nắm thanh tạ đòn, hạ từ từ xuống ngang ngực rồi đẩy mạnh lên. Hít vào khi hạ, thở ra khi đẩy.', 'CHEST_MIDDLE', 'NORMAL', 'Thanh tạ đòn, Ghế phẳng', 'https://example.com/bench_press.jpg', 'https://example.com/bench_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Incline Dumbbell Press', 'Nằm trên ghế dốc lên 30-45 độ. Dùng 2 tạ đơn, đẩy từ ngang ngực trên lên cao. Tập trung siết cơ ngực trên.', 'CHEST_UPPER', 'NORMAL', 'Tạ đơn, Ghế dốc', 'https://example.com/incline_press.jpg', 'https://example.com/incline_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Pull Up (Hít xà đơn)', 'Nắm xà đơn rộng hơn vai. Kéo toàn bộ cơ thể lên đến khi cằm vượt qua xà. Hạ người xuống chậm rãi.', 'LATS', 'HARD', 'Xà đơn', 'https://example.com/pull_up.jpg', 'https://example.com/pull_up.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Barbell Squat', 'Gánh thanh tạ đòn trên vai sau. Hạ mông xuống thấp như đang ngồi ghế, giữ lưng thẳng, đẩy mạnh người đứng lên.', 'QUADS', 'HARD', 'Thanh tạ đòn, Giá đỡ', 'https://example.com/squat.jpg', 'https://example.com/squat.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Romanian Deadlift (RDL)', 'Đứng thẳng giữ thanh tạ/tạ đơn. Đẩy hông về sau, hạ tạ xuống sát chân đến khi cảm thấy cơ đùi sau căng, sau đó đứng thẳng lên và siết mông.', 'HAMSTRINGS', 'NORMAL', 'Thanh tạ đòn / Tạ đơn', 'https://example.com/rdl.jpg', 'https://example.com/rdl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Dumbbell Shoulder Press', 'Ngồi trên ghế có điểm tựa lưng. Đẩy 2 tạ đơn qua đầu đến khi tay gần thẳng, hạ xuống chậm về vị trí ngang tai.', 'SHOULDERS_FRONT', 'NORMAL', 'Tạ đơn, Ghế tựa', 'https://example.com/shoulder_press.jpg', 'https://example.com/shoulder_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Lateral Raise', 'Đứng thẳng, hai tay cầm tạ đơn. Nâng tạ sang hai bên đến khi cánh tay song song với sàn, hạ xuống từ từ.', 'SHOULDERS_SIDE', 'EASY', 'Tạ đơn', 'https://example.com/lateral_raise.jpg', 'https://example.com/lateral_raise.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Barbell Bicep Curl', 'Đứng thẳng, cầm thanh tạ đòn bằng 2 tay. Cuốn thanh tạ lên phía ngực bằng cách gập cùi chỏ, sau đó hạ từ từ xuống.', 'BICEPS', 'EASY', 'Thanh tạ đòn', 'https://example.com/bicep_curl.jpg', 'https://example.com/bicep_curl.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Tricep Rope Pushdown', 'Dùng cáp và dây thừng. Đứng đối diện máy, gập cùi chỏ và nhấn dây xuống thẳng tay, siết cơ tay sau.', 'TRICEPS', 'EASY', 'Máy cáp, Dây thừng', 'https://example.com/tricep_pushdown.jpg', 'https://example.com/tricep_pushdown.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Plank', 'Chống 2 cùi chỏ và mũi chân xuống sàn. Giữ cơ thể thẳng như một tấm ván, siết chặt cơ bụng và cơ mông.', 'CORE', 'NORMAL', 'Không dụng cụ', 'https://example.com/plank.jpg', 'https://example.com/plank.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Crunch (Gập bụng)', 'Nằm ngửa, gập gối. Dùng cơ bụng cuộn người nâng vai lên khỏi mặt sàn, sau đó hạ từ từ xuống.', 'ABS_UPPER', 'EASY', 'Thảm tập', 'https://example.com/crunch.jpg', 'https://example.com/crunch.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Leg Press', 'Ngồi vào máy Leg Press. Đặt chân lên bàn đạp rộng bằng vai. Đẩy bàn đạp lên và hạ xuống sâu nhất có thể mà không cong lưng dưới.', 'QUADS', 'NORMAL', 'Máy Leg Press', 'https://example.com/leg_press.jpg', 'https://example.com/leg_press.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Seated Cable Row', 'Ngồi trên máy kéo cáp ngang. Đạp chân, giữ lưng thẳng, kéo tay cầm về phía sát bụng dưới và siết chặt cơ lưng.', 'LATS', 'NORMAL', 'Máy cáp', 'https://example.com/cable_row.jpg', 'https://example.com/cable_row.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Bulgarian Split Squat', 'Đứng một chân trước, một chân sau đặt lên ghế. Cầm tạ đơn hai tay. Hạ người xuống theo phương thẳng đứng cho đến khi đùi trước song song với sàn.', 'QUADS', 'HARD', 'Tạ đơn, Ghế phẳng', 'https://example.com/bss.jpg', 'https://example.com/bss.mp4', NULL, true),
(NOW(), 'System Admin', false, 'Push Up (Hít đất)', 'Chống hai tay xuống sàn, rộng hơn vai. Hạ người xuống đến khi ngực gần chạm sàn, sau đó đẩy người lên vị trí ban đầu.', 'CHEST_MIDDLE', 'NORMAL', 'Không dụng cụ', 'https://example.com/push_up.jpg', 'https://example.com/push_up.mp4', NULL, true);

-- ==========================================================
-- END OF SCRIPT
-- ==========================================================

const numberOfWorkouts = 30;
const workouts = [];

for (let x = 0; x <= numberOfWorkouts; x++) {
  const typeMin = Math.ceil(1);
  const typeMax = Math.floor(4);
  const difficultyMin = Math.ceil(1);
  const difficultyMax = Math.floor(5);
  const popMin = Math.ceil(1);
  const popMax = Math.floor(100);
  workouts.push(
    {
      _id: Math.random().toString(36).replace(/[^a-z]+/g, ''),
      title: Math.random().toString(36).substring(5),
      difficulty: Math.floor(Math.random() * (difficultyMax - difficultyMin)) + difficultyMin,
      type: Math.floor(Math.random() * (typeMax - typeMin)) + typeMin,
      popularity: Math.floor(Math.random() * (popMax - popMin)) + popMin,
      videoUrl: Math.random().toString(36).replace(/[^a-z]+/g, ''),
      thumbnailUrl: Math.random().toString(36).replace(/[^a-z]+/g, ''),
    }
  );
}


export default workouts;

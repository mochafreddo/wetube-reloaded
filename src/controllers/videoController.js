import Video from '../models/Video';

export const home = (req, res) => {
  console.log('Start');
  Video.find({})
    .exec()
    .then((videos) => {
      console.log('Finished');
      res.render('home', { pageTitle: 'Home', videos });
    })
    .catch((error) => {});
  console.log('I finish first');
};
export const watch = (req, res) => {
  const { id } = req.params;
  return res.render('watch', { pageTitle: 'Watching' });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render('edit', { pageTitle: 'Editing' });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  res.render('upload', { pageTitle: 'Upload Video' });
};
export const postUpload = (req, res) => {
  const { title } = req.body;
  return res.redirect('/');
};

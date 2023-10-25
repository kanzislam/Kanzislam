import error from "../error.js";

export default async ({ app, pug, path, fs, config, __dirname, jsStringify, model, convertToNumber, database, analyzeText, getElapsedTime }) => {

    const {
        Users,
        Categories,
        Topics,
        Comments,
        Tags,
        Likes,
        Reports,
        Views,
        Notifications,
        Images,
        Videos,
        Audios,
    } = model;

    app.get('/forum/topic/:topic', async (request, response) => {

        const topic = convertToNumber(request.params?.topic?.trim());
        const GetTopic = await database.getTopicData(topic);

        if (topic && GetTopic) {
            // إضافة مشاهدات الموضوع في قاعدة البيانات
            const lastViewsId = await Views.max('view_id').catch((error) => {
                console.log('حدث خطأ:', error);
            });
            const newViewsId = lastViewsId + 1;
            await Views.create({
                view_id: newViewsId,
                topic_id: topic
            }).catch((error) => {
                console.log(error);
            });
            const analyzeTextRaw = analyzeText(GetTopic?.topic?.content_raw);
            const keywords = analyzeTextRaw?.words;

            const options = {};
            options.website_name = config.WEBSITE_NAME;
            options.title = `${GetTopic?.topic?.title} - ${config.WEBSITE_NAME}`;
            options.keywords = keywords?.value;
            options.description = GetTopic?.topic?.description;
            options.preview = `${config.WEBSITE_DOMAIN}/puppeteer?title=${encodeURIComponent(GetTopic?.topic?.title)}&description=${encodeURIComponent(GetTopic?.topic?.description)}`
            options.session = request.session;
            options.TopicJosn = GetTopic;
            options.getElapsedTime = getElapsedTime;
            options.canEdit = GetTopic?.topic?.users?.username === request.session?.username;
            options.FORUM = config?.FORUM;
            const pugPath = path.join(__dirname, './views/forum/topic.pug');
            const render = pug.renderFile(pugPath, { options, jsStringify });
            response.send(render);
        }

        else {
            await error({ config, request, path, response, __dirname, pug, jsStringify });
        }

    });

    app.post('/create-comment', async (request, response) => {
        const topic_id = request.body?.topic_id;
        const content = request.body?.content;
        const user_id = request.body?.user_id;

        if (topic_id && content && user_id) {
            const lastCommentsId = await Comments.max('comment_id').catch((error) => {
                console.log('حدث خطأ:', error);
            });
            const newCommentsId = lastCommentsId + 1;
            await Comments.create({
                comment_id: newCommentsId,
                user_id: user_id,
                topic_id: topic_id,
                content: content,
            }).catch((error) => {
                console.log(error);
            });

            response.json({
                isCreatedComment: true
            })
        }

        else {
            response.json({
                isCreatedComment: false
            })
        }
    });

    app.post('/remove-comment', async (request, response) => {
        const comment_id = convertToNumber(request.body?.comment_id);
        const user_id = convertToNumber(request.body?.user_id);
        const sessiosUser_id = convertToNumber(request.session?.user_id);

        if (user_id && comment_id) {

            const getComment = await Comments.findOne({
                where: { comment_id: comment_id },
            }).catch((error) => {
                console.log(error);
            });

            if (getComment?.dataValues?.user_id === user_id && getComment?.dataValues?.user_id === sessiosUser_id) {

                const removeComment = await Comments.destroy({
                    where: { comment_id: comment_id },
                }).catch((error) => {
                    console.log(error);
                });

                if (removeComment == 1) {
                    response.json({
                        isRemoved: true
                    })
                }

                else {
                    response.status(404).json({
                        isRemoved: false
                    })
                }

            }

            else {
                response.status(404).json({
                    isRemoved: false
                })
            }

        }

        else {
            response.status(404).json({
                isRemoved: false
            })
        }
    });


    app.post('/like-topic', async (request, response) => {
        const topic_id = convertToNumber(request.body?.topic_id);
        const user_id = convertToNumber(request.body?.user_id);

        if (topic_id && user_id && request.session?.isLoggedIn) {

            const getLike = await Likes.findOne({
                where: { topic_id: topic_id, user_id: user_id },
            }).catch((error) => {
                console.log(error);
            });

            if (!getLike) {
                const lastLikesId = await Likes.max('like_id').catch((error) => {
                    console.log('حدث خطأ:', error);
                });
                const newLikesId = lastLikesId + 1;
                await Likes.create({
                    like_id: newLikesId,
                    user_id: user_id,
                    topic_id: topic_id,
                }).catch((error) => {
                    console.log(error);
                });

                response.json({
                    message: "تمت إضافة الإعجاب ✔️",
                    isLiked: true
                })
            }

            else {
                response.status(404).json({
                    message: "تمت إضافة الإعجاب من قبل ❗",
                    isLiked: false
                })
            }

        }

        else {
            response.status(404).json({
                message: "لم يتم إضافة الإعجاب ❌",
                isLiked: false
            })
        }
    });


    app.post('/report-topic', async (request, response) => {
        const topic_id = convertToNumber(request.body?.topic_id);
        const user_id = convertToNumber(request.body?.user_id);

        if (topic_id && user_id && request.session?.isLoggedIn) {

            const geReport = await Reports.findOne({
                where: { topic_id: topic_id, user_id: user_id },
            }).catch((error) => {
                console.log(error);
            });

            if (!geReport) {
                const lastReportsId = await Reports.max('report_id').catch((error) => {
                    console.log('حدث خطأ:', error);
                });
                const newReportsId = lastReportsId + 1;
                await Reports.create({
                    report_id: newReportsId,
                    user_id: user_id,
                    topic_id: topic_id,
                }).catch((error) => {
                    console.log(error);
                });

                response.json({
                    message: "تم الإبلاغ عن الموضع ✔️",
                    isReported: true
                })
            }

            else {
                response.status(404).json({
                    message: "تم الإبلاغ من قبل ❗",
                    isReported: false
                })
            }

        }

        else {
            response.status(404).json({
                message: "لم يتم الإبلاغ عن الموضوع ❌",
                isReported: false
            })
        }
    });

    app.post('/remove-topic', async (request, response) => {

        const topic_id = convertToNumber(request.body?.topic_id);
        const user_id = convertToNumber(request.body?.user_id);

        if (topic_id && user_id && request.session?.isLoggedIn) {
            const deleteTopic = await database?.deleteTopic(topic_id, user_id);
            if (deleteTopic?.isDeleted) {

                response.json({
                    message: deleteTopic?.message,
                    isDeleted: deleteTopic?.isDeleted
                });
            }
            else {
                response.status(404).json({
                    message: deleteTopic?.message,
                    isDeleted: deleteTopic?.isDeleted
                });
            }
        }

        else {
            response.status(404).json({
                message: "لايمكن حذف الموضوع ❌",
                isDeleted: false
            })
        }

    });
} 
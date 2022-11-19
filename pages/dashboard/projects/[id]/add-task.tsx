import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { useFormik } from "formik";
import * as Yup from "yup";
import cn from "classnames";
import Container from "../../../../components/ui/Container";
import DashboardHeader from "../../../../components/common/DashboardHeader";
import { Status, getQuery } from "../../../../utils";
import { SquaresPlusIcon } from "@heroicons/react/24/solid";
import Spinner from "../../../../components/ui/Spinner";
import TextBox from "../../../../components/ui/TextBox";
import TextArea from "../../../../components/ui/TextArea";
import SelectStatus from "../../../../components/common/SelectStatus";
import CommentList from "../../../../components/common/CommentList";
import type { Comment } from "../../../../components/common/CommentCard";
import useProject from "../../../../hooks/useProject";
import useAddTask from "../../../../hooks/useAddTask";

const AddTaskPage = () => {
  const [status, setStatus] = useState<Status>(0);
  const { query, isReady, replace } = useRouter();
  const { project, error } = useProject(getQuery(query.id));
  const sendRequest = useAddTask();
  const [comments, setComments] = useState<Comment[]>([]);
  const { values, handleSubmit, handleBlur, handleChange, touched, errors } =
    useFormik({
      initialValues: {
        name: "",
        description: "",
        tag: "",
      },
      onSubmit: async (values) => {
        const projectId = Array.isArray(query.id) ? query.id[0] : query.id;
        if (projectId) {
          const taskStatus = status as number;
          const project_id = parseInt(projectId);
          await sendRequest({
            ...values,
            status: taskStatus,
            project_id,
            comments,
          });
        }
      },
      validationSchema: Yup.object({
        name: Yup.string().required(),
        description: Yup.string().required(),
        tag: Yup.string().required(),
      }),
    });
  useEffect(() => {
    if (isReady && query.status) {
      const status = Array.isArray(query.status)
        ? query.status[0]
        : query.status;
      setStatus(parseInt(status) as Status);
    }
  }, [query, isReady]);

  useEffect(() => {
    if (error) {
      replace("/dashboard/projects");
    }
  }, [error, replace]);

  const addCommentHandler = (comment: Comment) => {
    setComments((prevComments) => {
      return [comment, ...prevComments];
    });
  };

  const likeCommentHandler = (id: number) => {
    const commentIndex = comments.findIndex((comment) => comment.id === id);
    if (commentIndex === -1) {
      return;
    }
    const newComments = [...comments];
    newComments[commentIndex] = {
      ...newComments[commentIndex],
      like: !newComments[commentIndex].like,
    };
    setComments(newComments);
  };

  const favouriteCommentHandler = (id: number) => {
    const commentIndex = comments.findIndex((comment) => comment.id === id);
    if (commentIndex === -1) {
      return;
    }
    const newComments = [...comments];
    newComments[commentIndex] = {
      ...newComments[commentIndex],
      favorite: !newComments[commentIndex].favorite,
    };
    setComments(newComments);
  };

  const removeCommentHandler = (id: number) => {
    setComments((prevComments) => {
      return prevComments.filter((comment) => comment.id !== id);
    });
  };

  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Container className="h-full flex flex-col">
      <DashboardHeader goBack />
      <div className="flex-1 mt-10 mb-6">
        <div className="flex items-center space-x-1">
          <SquaresPlusIcon
            className={cn("w-5 h-5", {
              "text-primary": status === 0,
              "text-progress": status === 1,
              "text-completed": status === 2,
            })}
          />
          <p className="text-gray-800">
            Opened a task for{" "}
            <span className="font-semibold text-black">{project.name}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-1">
          <div className="flex items-center">
            <TextBox
              className="flex-1 placeholder:text-2xl text-2xl md:placeholder:text-4xl md:text-4xl placeholder:font-normal text-slate-900 font-medium"
              placeholder="Enter Task name"
              error={Boolean(touched.name && errors.name)}
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
          </div>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Created by <span className="text-gray-800 font-medium">Daniel</span>{" "}
            on {moment(project.created_at).format("dddd D MMMM, YYYY")} at{" "}
            {moment(project.created_at).format("HH:ss")}
          </p>
          <div
            className={cn("flex items-center justify-between font-bold mt-3", {
              "text-primary": status === 0,
              "text-progress": status === 1,
              "text-completed": status === 2,
            })}
          >
            <div className="flex items-center space-x-1">
              <span className="text-xl">#</span>
              <TextBox
                placeholder="Add Tag..."
                className="uppercase w-8/12 sm:w-auto placeholder:font-normal"
                value={values.tag}
                error={Boolean(touched.tag && errors.tag)}
                name="tag"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="flex space-x-2 items-center">
              <span className="text-black hidden md:inline font-medium">
                Status:
              </span>
              <SelectStatus status={status} onChange={setStatus} />
            </div>
          </div>
          <TextArea
            name="description"
            placeholder="Add Description..."
            className="w-full p-0 text-gray-800 mt-2"
            rows={2}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.description && errors.description)}
          />
          <div className="mt-2">
            <p className="text-lg lg:text-xl font-medium mb-5">
              Comments ({comments.length})
            </p>
            <CommentList
              comments={comments}
              onAddComment={addCommentHandler}
              onRemoveComment={removeCommentHandler}
              onAddFavorite={favouriteCommentHandler}
              onLikeComment={likeCommentHandler}
              status={status}
            />
          </div>
          <div className="flex justify-end mt-5">
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-gray-800 transition-all duration-300 font-medium shadow-sm uppercase bg-gray-300 focus:outline-none hover:shadow-md hover:bg-gray-400/60"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
};

AddTaskPage.isAuth = true;

export default AddTaskPage;

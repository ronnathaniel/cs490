import { useState, useEffect } from "react";
import { useParams } from "react-router";
import RichTextEditor from "./RichTextEditor.js";
import Services from "./Services";
import ListComments from "./ListComments.js";

const PostDetails = props => {
    const { id } = useParams()
    const { user_poster_id } = props.user_poster_id
    const [ comments, setComments ] = useState([]);
    const [ refresh, setRefresh ] = useState(false)

    const handleRefresh = r => {
        if (r) {
          setRefresh(r);
          setRefresh(false);
        }
    }

    const refreshComments = () => {
        Services.list_comments({
            post_id: id,
        })
            .then(r => {
                setComments(r.comments);
                return r;
            })
            .catch(err => console.log(err));
    }

    useEffect(() => {
        refreshComments()
    }, [refresh, id, user_poster_id])


    const createMarkup = text => {
        return {__html: String(text)};
    }

    return (
        <div className="post-details">
            <h4>{props.created_at}</h4>
            <div className="post">
                <div className="post-pic">
                    <img src="https://picsum.photos/200" alt="Profile"></img>
                </div>
                <div className="leftside">
                    <div className="post-info">
                        <h5><b>{props.user_poster_id}</b></h5>
                    </div>
                    <div className="post-title">

                    </div>
                    <div className="post-body" dangerouslySetInnerHTML={createMarkup(props.text)} />
                </div>
            </div>

            <div className="detailComments">
                <h5>Comments:</h5>
                { comments && <ListComments
                    user_id={props.user_id} comments={comments}
                    is_admin={props.is_admin} list_comments={refreshComments}
                /> }
            </div>
            <div className="writeComments">
                <RichTextEditor
                    user_id={props.user_id}
                    post_id = {id}
                    callback={Services.create_comment}
                    type="create_comment"
                    handleRefresh={handleRefresh}
                />
            </div>
        </div>
    );
}

export default PostDetails;
